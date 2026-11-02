-- ==============================================================================
-- LUBA CanFindIT · City of Malolos, Bulacan Road Operations
-- Complete Supabase PostgreSQL Schema, Realtime Configuration & Seed Data
-- ==============================================================================
-- Paste this entire script into your Supabase Dashboard -> SQL Editor and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. REPORTS TABLE (Core Citizen Pothole Reports & Workflow)
CREATE TABLE IF NOT EXISTS public.reports (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  road VARCHAR(255) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  jurisdiction VARCHAR(50) NOT NULL DEFAULT 'City',
  severity VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(50) NOT NULL DEFAULT 'Under Review',
  coordinates VARCHAR(100) NOT NULL DEFAULT '14.8524° N, 120.8168° E',
  latitude NUMERIC(10, 7) NULL,
  longitude NUMERIC(10, 7) NULL,
  landmark TEXT NULL,
  description TEXT NULL,
  photo_url TEXT NULL,
  repair_photo_url TEXT NULL,
  assigned_team VARCHAR(100) NULL,
  assigned_team_code VARCHAR(50) NULL,
  lead_personnel VARCHAR(100) NULL,
  priority VARCHAR(20) NULL DEFAULT 'High',
  target_completion VARCHAR(100) NULL,
  instructions TEXT NULL,
  citizen_name VARCHAR(100) NULL,
  citizen_email VARCHAR(150) NULL,
  citizen_mobile VARCHAR(50) NULL,
  verification_notes TEXT NULL,
  verified_by VARCHAR(100) NULL,
  verified_at TIMESTAMPTZ NULL,
  assigned_at TIMESTAMPTZ NULL,
  resolved_at TIMESTAMPTZ NULL,
  rejection_category VARCHAR(150) NULL,
  rejection_reason TEXT NULL,
  reported_date VARCHAR(50) NULL DEFAULT '19 Oct 2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant spatial & status queries
CREATE INDEX IF NOT EXISTS idx_reports_code ON public.reports (code);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_barangay ON public.reports (barangay);

-- 3. TEAMS TABLE (Maintenance Units & Dispatch)
CREATE TABLE IF NOT EXISTS public.teams (
  code VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  lead VARCHAR(100) NOT NULL,
  service_area TEXT NOT NULL,
  crew_size VARCHAR(100) NOT NULL DEFAULT '4 maintenance personnel',
  specialty TEXT NOT NULL,
  workload VARCHAR(100) NOT NULL DEFAULT '0 assigned · 0 in progress',
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  phone VARCHAR(50) NULL,
  email VARCHAR(150) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USERS TABLE (LGU Staff, Administrators & Registered Citizens)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mobile VARCHAR(50) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Citizen',
  area VARCHAR(150) NULL DEFAULT 'City Engineering Office',
  status VARCHAR(30) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE (Immutable Event History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  report_code VARCHAR(50) NULL,
  actor VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS) WITH OPEN PUBLIC POLICIES
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read, insert, update for mobile apps & admin console
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access on reports" ON public.reports;
  CREATE POLICY "Public access on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access on teams" ON public.teams;
  CREATE POLICY "Public access on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access on users" ON public.users;
  CREATE POLICY "Public access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access on audit_logs" ON public.audit_logs;
  CREATE POLICY "Public access on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 7. ENABLE REALTIME BROADCASTING ON CORE TABLES
-- Idempotent registration avoids ERROR 42710 ("relation already member of publication")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;

-- Enable REPLICA IDENTITY FULL so realtime receives all updated/deleted record attributes
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

-- 8. PHOTO STORAGE BUCKET FOR CITIZEN & MAINTENANCE REPAIR PHOTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('pothole-photos', 'pothole-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy allowing anyone to view and upload pothole evidence photos
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access to pothole photos" ON storage.objects;
  CREATE POLICY "Public access to pothole photos" ON storage.objects
    FOR ALL USING (bucket_id = 'pothole-photos')
    WITH CHECK (bucket_id = 'pothole-photos');
END $$;

-- ==============================================================================
-- 9. INITIAL SEED DATA (City of Malolos Teams, Reports & Admin)
-- ==============================================================================

-- Seed Teams
INSERT INTO public.teams (code, title, lead, service_area, crew_size, specialty, workload, status, phone, email)
VALUES
  ('MALOLOS-ALPHA', 'Malolos Team Alpha', 'Engr. Paolo Santos', 'Highway / Commercial Corridor (Guinhawa / Bulihan / Tikay / Sumapang Matanda)', '4 maintenance personnel', 'Asphalt patching & concrete re-blocking', '8 assigned · 3 in progress', 'Active', '+63 917 000 0210', 'paolo.santos@malolos.gov.ph'),
  ('MALOLOS-BRAVO', 'Malolos Team Bravo', 'Engr. Jessa Aquino', 'Poblacion / Rural (Barasoain / San Vicente / Santo Rosario / Mabolo / Atlag)', '6 maintenance personnel', 'Drainage cover restoration & patching', '6 assigned · 4 in progress', 'Active', '+63 917 000 0211', 'jessa.aquino@malolos.gov.ph')
ON CONFLICT (code) DO NOTHING;

-- Seed Admin, Maintenance Staff & Citizen Reporters
INSERT INTO public.users (full_name, email, mobile, role, area, status)
VALUES
  ('System Administrator', 'admin@malolos.gov.ph', '+63 917 000 0001', 'LGU administrator', 'City Engineering Office', 'Active'),
  ('Ana Dela Cruz',        'ana.delacruz@malolos.gov.ph', '+63 917 000 0101', 'LGU administrator', 'City Engineering Office', 'Active'),
  ('Engr. Paolo Santos',   'paolo.santos@malolos.gov.ph', '+63 917 000 0210', 'Maintenance lead',  'Malolos Team Alpha',     'Active'),
  ('Carlo Ramos',          'carlo.ramos@malolos.gov.ph',  '+63 917 000 0245', 'Maintenance crew',  'Malolos Team Bravo',     'Active'),
  ('Marco Lim',            'marco.lim@malolos.gov.ph',    '+63 917 000 0267', 'LGU reviewer',      'City Engineering Office', 'Invited'),
  ('Mika Reyes',           'mika.reyes@malolos.gov.ph',   '+63 917 000 0184', 'Citizen',           'Guinhawa',                'Active'),
  ('Luis Mendoza',         'luis.mendoza@malolos.gov.ph', '+63 917 000 0192', 'Citizen',           'San Vicente (Poblacion)', 'Active'),
  ('Bea Navarro',          'bea.navarro@malolos.gov.ph',  '+63 917 000 0234', 'Citizen',           'Mabolo',                  'Active'),
  ('Ina Villanueva',       'ina.villanueva@malolos.gov.ph', '+63 917 000 0256', 'Citizen',         'Bulihan',                 'Active'),
  ('Min Yoongi',           'min@gmail.com',               '+63 917 888 8862', 'Citizen',           'Dakila',                  'Active'),
  ('John Emhar Boncalos',  'john.boncalos@gmail.com',     '+63 917 555 5453', 'Citizen',           'Guinhawa',                'Active'),
  ('casey regalario',      'casey.regalario@gmail.com',   '+63 917 222 2168', 'Citizen',           'Catmon',                  'Active'),
  ('Alexa Viray',          'alexa.viray@gmail.com',       '+63 917 444 4361', 'Citizen',           'Mojon',                   'Active')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  mobile = EXCLUDED.mobile,
  role = EXCLUDED.role,
  area = EXCLUDED.area,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Synchronize sequence counters to avoid duplicate key errors on future inserts
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE(max(id), 1)) FROM public.users;

-- Seed Initial City of Malolos Reports
INSERT INTO public.reports (
  code, road, barangay, jurisdiction, severity, status, reported_date, coordinates,
  landmark, description, citizen_name, citizen_email, citizen_mobile, photo_url, assigned_team
) VALUES
  ('RW-2026-0842', 'MacArthur Highway (Manila North Road)', 'Guinhawa', 'DPWH-National', 'High', 'Under Review', '19 Oct 2026', '14.8524° N, 120.8168° E', 'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan', 'Deep asphalt pothole along MacArthur Highway northbound lane. Motorcycles and jeepneys swerve into oncoming traffic; water collects during rain.', 'Mika Reyes', 'mika.reyes@malolos.gov.ph', '+63 917 000 0184', '/assets/pothole-citizen.jpg', NULL),
  ('RW-2026-0841', 'Capitol Compound Road', 'Guinhawa', 'City', 'Low', 'Assigned', '19 Oct 2026', '14.8540° N, 120.8155° E', 'Near Provincial Capitol building entrance', 'Surface crack developing near visitor parking bay.', 'Luis Mendoza', 'luis.mendoza@malolos.gov.ph', '+63 917 000 0192', '/assets/pothole-citizen.jpg', 'Malolos Team Alpha'),
  ('RW-2026-0840', 'Paseo del Congreso', 'San Vicente', 'City', 'Medium', 'In Progress', '19 Oct 2026', '14.8510° N, 120.8140° E', 'Front of historic convent wall', 'Transverse pothole spanning 1.1 meters across the westbound lane.', 'Carlos Santos', 'carlos.santos@malolos.gov.ph', '+63 917 000 0215', '/assets/pothole-citizen.jpg', 'Malolos Team Bravo'),
  ('RW-2026-0819', 'MacArthur Highway (Manila North Road)', 'Tikay', 'DPWH-National', 'High', 'Verified', '19 Oct 2026', '14.8521° N, 120.8171° E', 'Southbound lane opposite BSU junction, 38m away from 0842', 'Companion pothole along southbound carriageway.', 'Ramon Lopez', 'ramon.lopez@malolos.gov.ph', '+63 917 000 0240', '/assets/pothole-citizen.jpg', NULL)
ON CONFLICT (code) DO NOTHING;

-- Seed Initial Audit Log
INSERT INTO public.audit_logs (report_code, actor, status, note, created_at)
VALUES
  ('RW-2026-0842', 'Citizen Mika Reyes', 'Submitted', 'Initial submission via mobile portal with photo evidence.', '2026-10-19 09:24:00+08'),
  ('RW-2026-0841', 'Engr. Paolo Santos', 'Assigned', 'Dispatched Malolos Team Alpha for site assessment.', '2026-10-19 10:30:00+08'),
  ('RW-2026-0840', 'Engr. Jessa Aquino', 'In Progress', 'Cold asphalt patching underway on Paseo del Congreso.', '2026-10-19 11:00:00+08')
ON CONFLICT DO NOTHING;

-- Synchronize reports sequence counter
SELECT setval(pg_get_serial_sequence('public.reports', 'id'), COALESCE(max(id), 1)) FROM public.reports;

-- ==============================================================================
-- 10. REMOVE EXCLUDED SAMPLE REPORTS FROM DATABASE
-- ==============================================================================
DELETE FROM public.reports 
WHERE code IN (
  'RW-2026-0839',
  'RW-2026-0838',
  'RW-2026-0837',
  'RW-2026-0836',
  'RW-2026-0835',
  'RW-2026-0798',
  'RW-2026-0789',
  'RW-2026-0771',
  'RW-2026-0745',
  'RW-2026-0723'
);

-- ==============================================================================
-- 11. AUTOMATIC CITIZEN AUTH SYNC TRIGGER
-- ==============================================================================
-- When a citizen signs up or logs into Supabase Auth (via mobile app or web),
-- this trigger copies their profile into public.users with role 'Citizen'
-- so they instantly reflect in Admin Portal -> User Management.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_mobile TEXT;
  v_area TEXT;
BEGIN
  -- Extract name from metadata or email username
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract mobile
  v_mobile := COALESCE(
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'phone',
    NEW.phone,
    ''
  );
  
  -- Extract barangay or area
  v_area := COALESCE(
    NEW.raw_user_meta_data->>'area',
    NEW.raw_user_meta_data->>'barangay',
    'City of Malolos'
  );

  INSERT INTO public.users (full_name, email, mobile, role, area, status, created_at, updated_at)
  VALUES (
    v_name,
    NEW.email,
    v_mobile,
    'Citizen',
    v_area,
    'Active',
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = CASE WHEN EXCLUDED.full_name <> '' AND EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name ELSE public.users.full_name END,
    mobile = CASE WHEN EXCLUDED.mobile <> '' AND EXCLUDED.mobile IS NOT NULL THEN EXCLUDED.mobile ELSE public.users.mobile END,
    area = CASE WHEN EXCLUDED.area <> '' AND EXCLUDED.area IS NOT NULL THEN EXCLUDED.area ELSE public.users.area END,
    status = 'Active',
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users for new registrations and logins
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF last_sign_in_at, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Immediate backfill: Copy all existing auth.users accounts into public.users
INSERT INTO public.users (full_name, email, mobile, role, area, status, created_at, updated_at)
SELECT 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', raw_user_meta_data->>'user_name', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'mobile', raw_user_meta_data->>'phone', phone, ''),
  'Citizen',
  COALESCE(raw_user_meta_data->>'area', raw_user_meta_data->>'barangay', 'City of Malolos'),
  'Active',
  COALESCE(created_at, NOW()),
  NOW()
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  full_name = CASE WHEN EXCLUDED.full_name <> '' AND EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name ELSE public.users.full_name END,
  mobile = CASE WHEN EXCLUDED.mobile <> '' AND EXCLUDED.mobile IS NOT NULL THEN EXCLUDED.mobile ELSE public.users.mobile END,
  status = 'Active',
  updated_at = NOW();

-- Resync user sequence
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE(max(id), 1)) FROM public.users;

-- ==============================================================================
-- 12. AUTOMATIC REPORT CODE GENERATOR TRIGGER
-- ==============================================================================
-- Automatically generates 'RW-YYYY-XXXX' report code if omitted on insert
CREATE OR REPLACE FUNCTION public.set_default_report_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR trim(NEW.code) = '' THEN
    NEW.code := 'RW-' || to_char(NOW(), 'YYYY') || '-' || lpad(COALESCE(NEW.id, nextval(pg_get_serial_sequence('public.reports', 'id')))::text, 4, '0');
  END IF;
  IF NEW.road IS NULL OR trim(NEW.road) = '' THEN
    NEW.road := 'Unspecified Road';
  END IF;
  IF NEW.barangay IS NULL OR trim(NEW.barangay) = '' THEN
    NEW.barangay := 'Guinhawa';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_default_report_code ON public.reports;
CREATE TRIGGER trg_set_default_report_code
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_report_code();

-- ==============================================================================
-- 13. AUTO-SYNC CITIZEN REPORTER TO USERS DIRECTORY ON REPORT CREATION
-- ==============================================================================
-- Automatically ensures any citizen submitting a report is listed in public.users
CREATE OR REPLACE FUNCTION public.sync_reporter_to_users()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.citizen_email IS NOT NULL AND trim(NEW.citizen_email) <> '' THEN
    INSERT INTO public.users (full_name, email, mobile, role, area, status, created_at, updated_at)
    VALUES (
      COALESCE(NEW.citizen_name, split_part(NEW.citizen_email, '@', 1)),
      NEW.citizen_email,
      COALESCE(NEW.citizen_mobile, ''),
      'Citizen',
      COALESCE(NEW.barangay, 'City of Malolos'),
      'Active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = CASE WHEN EXCLUDED.full_name <> '' AND EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name ELSE public.users.full_name END,
      mobile = CASE WHEN EXCLUDED.mobile <> '' AND EXCLUDED.mobile IS NOT NULL THEN EXCLUDED.mobile ELSE public.users.mobile END,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_reporter_to_users ON public.reports;
CREATE TRIGGER trg_sync_reporter_to_users
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_reporter_to_users();


