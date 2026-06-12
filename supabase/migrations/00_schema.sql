-- Enable PostGIS extension for spatial mapping
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create households table
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    time_poverty INTEGER NOT NULL CHECK (time_poverty IN (2, 5, 8, 10)),
    material_deficit INTEGER NOT NULL CHECK (material_deficit IN (2, 5, 8, 10)),
    landmark_code TEXT NOT NULL,
    ups_score NUMERIC GENERATED ALWAYS AS ((time_poverty * 0.5 + material_deficit * 0.5) * 10) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '180 days') NOT NULL
);

-- Create students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tutors table
CREATE TABLE tutors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    verified_by_elder BOOLEAN DEFAULT FALSE NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    distance_km NUMERIC,
    bio TEXT,
    subjects TEXT[] NOT NULL,
    availability TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create hubs table
CREATE TABLE hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    settlement TEXT NOT NULL,
    capacity_status INTEGER DEFAULT 0 NOT NULL CHECK (capacity_status BETWEEN 0 AND 100),
    max_capacity INTEGER DEFAULT 50 NOT NULL,
    current_capacity INTEGER DEFAULT 0 NOT NULL,
    available_assets TEXT[] NOT NULL,
    walking_distance_mins INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sessions table with CHECK constraint: status = 'confirmed' requires elder_approval_pin
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    elder_approval_pin TEXT,
    CONSTRAINT confirmed_requires_pin CHECK (status <> 'confirmed' OR elder_approval_pin IS NOT NULL),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create elders table
CREATE TABLE elders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    approval_pin TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY household_access ON households
    FOR ALL
    USING (phone = auth.jwt() ->> 'phone');

CREATE POLICY student_access ON students
    FOR ALL
    USING (household_id IN (
        SELECT id FROM households WHERE phone = auth.jwt() ->> 'phone'
    ));

-- pg_cron cleanup setup for 180-day data expiry
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'delete-expired-households',
    '0 0 * * *', -- Run daily at midnight
    $$DELETE FROM households WHERE data_expires_at < now()$$
);
