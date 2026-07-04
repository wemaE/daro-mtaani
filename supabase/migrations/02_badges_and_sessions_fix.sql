-- 1. Create Profiles Table to link auth.users to our application domain
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'tutor', 'elder', 'admin')),
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Modify existing Badges table or create it to support criteria and student gamification
-- Drop existing badges if it was strictly a tutor-only table to rebuild with the requested fields
DROP TABLE IF EXISTS public.badges CASCADE;

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria_type TEXT NOT NULL, -- e.g., 'sessions_completed', 'streak_days'
  criteria_value INT NOT NULL,  -- e.g., 5, 10
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create user_badges junction table for mapping awarded badges to users (students/tutors/etc.)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- 4. Align sessions table with the required schema
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Ensure students and tutors are linked to profiles
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 6. Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY profiles_self_access ON public.profiles
  FOR ALL
  USING (id = auth.uid());

-- Badges Policies (Read-only for all authenticated users)
CREATE POLICY badges_read_all ON public.badges
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- User Badges Policies (Users can read/manage their own badges)
CREATE POLICY user_badges_self_access ON public.user_badges
  FOR ALL
  USING (user_id = auth.uid());

-- Sessions Policy (Ensure read-access for participants or elders)
DROP POLICY IF EXISTS sessions_participant_read ON public.sessions;
CREATE POLICY sessions_participant_access ON public.sessions
  FOR ALL
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.household_id IN (
        SELECT h.id FROM public.households h
        WHERE h.phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
      )
    )
    OR
    tutor_id IN (
      SELECT t.id FROM public.tutors t
      WHERE t.phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.elders e
      WHERE e.phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
    )
  );

-- 7. Create the badge awarding PL/pgSQL function
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_student_profile_id UUID;
  v_tutor_profile_id UUID;
  v_completed_student_sessions INT;
  v_completed_tutor_sessions INT;
  v_badge RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Retrieve profile IDs linked to the student and tutor
    SELECT profile_id INTO v_student_profile_id FROM public.students WHERE id = NEW.student_id;
    SELECT profile_id INTO v_tutor_profile_id FROM public.tutors WHERE id = NEW.tutor_id;

    -- Award student badges if profile is linked
    IF v_student_profile_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_completed_student_sessions 
      FROM public.sessions s
      WHERE s.student_id IN (SELECT id FROM public.students WHERE profile_id = v_student_profile_id)
        AND s.status = 'completed';

      FOR v_badge IN 
        SELECT * FROM public.badges WHERE criteria_type = 'sessions_completed'
      LOOP
        IF v_completed_student_sessions >= v_badge.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id)
          VALUES (v_student_profile_id, v_badge.id)
          ON CONFLICT (user_id, badge_id) DO NOTHING;
        END IF;
      END LOOP;
    END IF;

    -- Award tutor badges if profile is linked
    IF v_tutor_profile_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_completed_tutor_sessions 
      FROM public.sessions s
      WHERE s.tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = v_tutor_profile_id)
        AND s.status = 'completed';

      FOR v_badge IN 
        SELECT * FROM public.badges WHERE criteria_type = 'sessions_completed'
      LOOP
        IF v_completed_tutor_sessions >= v_badge.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id)
          VALUES (v_tutor_profile_id, v_badge.id)
          ON CONFLICT (user_id, badge_id) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Bind function as a trigger
DROP TRIGGER IF EXISTS trigger_award_badges ON public.sessions;
CREATE TRIGGER trigger_award_badges
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_badges();

-- 9. Enable Supabase Realtime broadcast for user_badges
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
