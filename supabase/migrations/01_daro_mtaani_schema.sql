-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop Existing Tables and Views
DROP VIEW IF EXISTS tutors_public CASCADE;
DROP TABLE IF EXISTS bias_audit_log CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS hubs CASCADE;
DROP TABLE IF EXISTS tutors CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS elders CASCADE;
DROP TABLE IF EXISTS landmarks CASCADE;
DROP TABLE IF EXISTS scout_invocations CASCADE;

-- Create Landmarks Table
CREATE TABLE landmarks (
  code TEXT PRIMARY KEY,
  settlement TEXT NOT NULL,
  display_name_sw TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  approx_location GEOGRAPHY(Point,4326) NOT NULL
);

-- Seed Landmarks
INSERT INTO landmarks (code, settlement, display_name_sw, display_name_en, approx_location) VALUES
-- Mathare
('MTH-CHIEF', 'Mathare', 'Kambi ya Chifu Mathare', 'Mathare Chief''s Camp', 'SRID=4326;POINT(36.8584 -1.2588)'::geography),
('MTH-STAGE10', 'Mathare', 'Kituo cha Stage 10', 'Stage 10 Bus Stop', 'SRID=4326;POINT(36.8621 -1.2612)'::geography),
('MTH-BRIDGE', 'Mathare', 'Daraja la Mto Mathare', 'Mathare River Bridge', 'SRID=4326;POINT(36.8602 -1.2595)'::geography),
('MTH-4A', 'Mathare', 'Shule ya Msingi Mathare 4A', 'Mathare 4A Primary School', 'SRID=4326;POINT(36.8640 -1.2570)'::geography),
('MTH-KOSOVE', 'Mathare', 'Eneo la Kosovo', 'Kosovo Area', 'SRID=4326;POINT(36.8550 -1.2600)'::geography),
('MTH-MAU', 'Mathare', 'Mau Mau Road Corner', 'Mau Mau Road Corner', 'SRID=4326;POINT(36.8570 -1.2625)'::geography),

-- Kibera
('KBR-SOWETO', 'Kibera', 'Ukumbi wa Soweto East', 'Soweto East Community Hall', 'SRID=4326;POINT(36.7880 -1.3150)'::geography),
('KBR-OLYMPIC', 'Kibera', 'Shule ya Msingi Olympic', 'Olympic Primary Area', 'SRID=4326;POINT(36.7905 -1.3120)'::geography),
('KBR-KAMEERA', 'Kibera', 'Kituo cha Kameera', 'Kameera Stage', 'SRID=4326;POINT(36.7851 -1.3142)'::geography),
('KBR-TOI', 'Kibera', 'Soko la Toi', 'Toi Market', 'SRID=4326;POINT(36.7950 -1.3090)'::geography),
('KBR-DC', 'Kibera', 'Ofisi ya DC Kibera', 'Kibera DC Office', 'SRID=4326;POINT(36.7920 -1.3170)'::geography),
('KBR-AYANY', 'Kibera', 'Eneo la Ayany Estate', 'Ayany Estate Area', 'SRID=4326;POINT(36.7820 -1.3110)'::geography),

-- Mukuru
('MKR-RUBEN', 'Mukuru', 'Kituo cha Ruben', 'Ruben Centre Landmark', 'SRID=4326;POINT(36.8785 -1.3205)'::geography),
('MKR-STAGE', 'Mukuru', 'Kituo cha Mukuru Kwa Njenga', 'Mukuru Stage', 'SRID=4326;POINT(36.8812 -1.3218)'::geography),
('MKR-LUNGA', 'Mukuru', 'Barabara ya Lunga Lunga', 'Lunga Lunga Road', 'SRID=4326;POINT(36.8740 -1.3230)'::geography),
('MKR-SINA', 'Mukuru', 'Kijiji cha Sinai', 'Sinai Village', 'SRID=4326;POINT(36.8710 -1.3190)'::geography),
('MKR-SPARES', 'Mukuru', 'Eneo la Pipeline Spares', 'Pipeline Spares Corner', 'SRID=4326;POINT(36.8850 -1.3250)'::geography),

-- Kawangware
('KWG-CONGO', 'Kawangware', 'Kituo cha Congo', 'Congo Stage Area', 'SRID=4326;POINT(36.7456 -1.2885)'::geography),
('KWG-BP', 'Kawangware', 'Kituo cha BP', 'BP Station Stage', 'SRID=4326;POINT(36.7490 -1.2862)'::geography),
('KWG-SDA', 'Kawangware', 'Kanisa la SDA Kawangware', 'SDA Kawangware Church', 'SRID=4326;POINT(36.7430 -1.2910)'::geography),
('KWG-METRO', 'Kawangware', 'Soko la Metro', 'Metro Market', 'SRID=4326;POINT(36.7470 -1.2895)'::geography),
('KWG-GATINA', 'Kawangware', 'Shule ya Msingi Gatina', 'Gatina Primary School', 'SRID=4326;POINT(36.7390 -1.2870)'::geography);

-- Create Households Table
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT UNIQUE NOT NULL,
  landmark_code TEXT REFERENCES landmarks(code),
  settlement TEXT NOT NULL,
  time_poverty_score INT CHECK (time_poverty_score BETWEEN 0 AND 10) NOT NULL,
  material_deficit_score INT CHECK (material_deficit_score BETWEEN 0 AND 10) NOT NULL,
  ups_score NUMERIC GENERATED ALWAYS AS ((time_poverty_score * 0.5 + material_deficit_score * 0.5) * 10) STORED,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  data_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '180 days') NOT NULL
);

-- Create Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  grade_level INT NOT NULL,
  cbc_strands TEXT[] NOT NULL
);

-- Create Elders Table
CREATE TABLE elders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('hub_manager', 'mama_mboga', 'regional_educator')) NOT NULL,
  settlement TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id)
);

-- Create Tutors Table
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  institution TEXT,
  subjects TEXT[] NOT NULL,
  rating NUMERIC DEFAULT 0 NOT NULL,
  verified_by_elder BOOLEAN DEFAULT false NOT NULL,
  verified_by_elder_id UUID REFERENCES elders(id),
  verified_at TIMESTAMPTZ,
  badge_level INT DEFAULT 0 NOT NULL,
  ledger JSONB DEFAULT '[]'::jsonb NOT NULL,
  location GEOGRAPHY(Point,4326) NOT NULL,
  settlement TEXT NOT NULL
);

-- Create Hubs Table
CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location GEOGRAPHY(Point,4326) NOT NULL,
  assets TEXT[] NOT NULL,
  capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0 NOT NULL,
  settlement TEXT NOT NULL,
  over_capacity BOOLEAN DEFAULT false NOT NULL
);

-- Create Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending_elder_approval', 'confirmed', 'completed', 'cancelled')) NOT NULL,
  elder_approval_pin TEXT,
  cbc_topic TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Badges Table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  level INT DEFAULT 1 NOT NULL,
  sessions_required INT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  certificate_url TEXT,
  linkedin_pushed BOOLEAN DEFAULT false NOT NULL
);

-- Create Bias Audit Log Table
CREATE TABLE bias_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID REFERENCES elders(id),
  tutor_id UUID REFERENCES tutors(id),
  action TEXT NOT NULL,
  settlement TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  protocol TEXT DEFAULT 'TRACK' NOT NULL,
  notes TEXT
);

-- Create Scout Invocations Table for Agent rate limiting
CREATE TABLE scout_invocations (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE PRIMARY KEY,
  invocations_today INT DEFAULT 0 NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  cached_result JSONB,
  last_reset_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Public View for Tutors (Excluding PII phone_hash)
CREATE OR REPLACE VIEW tutors_public AS
SELECT
  id,
  display_name,
  institution,
  subjects,
  rating,
  verified_by_elder,
  verified_by_elder_id,
  verified_at,
  badge_level,
  ledger,
  location,
  settlement
FROM tutors;

-- Trigger Function to Enforce Elder PIN for Confirmed Sessions
CREATE OR REPLACE FUNCTION enforce_elder_pin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (NEW.elder_approval_pin IS NULL OR NEW.elder_approval_pin = '') THEN
    RAISE EXCEPTION 'Session confirmation requires a valid Elders Council approval PIN.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_elder_pin
BEFORE INSERT OR UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION enforce_elder_pin();

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Households RLS Policies
CREATE POLICY household_self_access ON households
  FOR ALL
  USING (phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex'));

-- Students RLS Policies
CREATE POLICY student_household_access ON students
  FOR ALL
  USING (household_id IN (
    SELECT id FROM households WHERE phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
  ));

-- Tutors RLS Policies
CREATE POLICY tutors_public_read ON tutors
  FOR SELECT
  USING (true);

-- Hubs RLS Policies
CREATE POLICY hubs_public_read ON hubs
  FOR SELECT
  USING (true);

-- Sessions RLS Policies
CREATE POLICY sessions_participant_read ON sessions
  FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
    )
    OR
    student_id IN (
      SELECT s.id FROM students s
      JOIN households h ON s.household_id = h.id
      WHERE h.phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
    )
    OR
    EXISTS (
      SELECT 1 FROM elders e
      WHERE e.phone_hash = encode(sha256(coalesce(auth.jwt() ->> 'phone', '')::bytea), 'hex')
    )
  );

-- Scheduled Cron Jobs
-- Daily deletion of expired households
SELECT cron.schedule(
  'delete-expired-households',
  '0 0 * * *',
  $$DELETE FROM households WHERE data_expires_at < now()$$
);

-- Every 15 min check for hub over capacity
SELECT cron.schedule(
  'recompute-hubs-over-capacity',
  '*/15 * * * *',
  $$UPDATE hubs SET over_capacity = (current_occupancy::float / capacity) >= 0.8$$
);

-- Hub routing PostGIS function
CREATE OR REPLACE FUNCTION route_hubs(
  p_landmark_code TEXT,
  p_required_assets TEXT[],
  p_max_distance_meters FLOAT DEFAULT 3000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location GEOGRAPHY(Point, 4326),
  assets TEXT[],
  capacity INT,
  current_occupancy INT,
  settlement TEXT,
  over_capacity BOOLEAN,
  distance_meters FLOAT
) AS $$
DECLARE
  v_landmark_loc GEOGRAPHY(Point, 4326);
BEGIN
  -- Get landmark location
  SELECT approx_location INTO v_landmark_loc
  FROM landmarks
  WHERE code = p_landmark_code;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.location,
    h.assets,
    h.capacity,
    h.current_occupancy,
    h.settlement,
    h.over_capacity,
    ST_Distance(h.location, v_landmark_loc) AS distance_meters
  FROM hubs h
  WHERE 
    h.over_capacity = false
    AND ST_DWithin(h.location, v_landmark_loc, p_max_distance_meters)
    AND (p_required_assets IS NULL OR h.assets @> p_required_assets)
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

