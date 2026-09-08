-- NETRA Database Schema + Seed (Combined)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'investigator', 'supervisor')),
  department TEXT DEFAULT 'CYBER INTEL DIV',
  badge_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Closed', 'Archived')),
  priority TEXT NOT NULL DEFAULT 'High' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  description TEXT,
  source TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FIR Records
CREATE TABLE firs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fir_number TEXT UNIQUE NOT NULL,
  district_name TEXT,
  unit_name TEXT,
  fir_year INTEGER,
  fir_month INTEGER,
  fir_day INTEGER,
  offence_duration TEXT,
  fir_type TEXT,
  fir_stage TEXT,
  complaint_mode TEXT,
  crime_group_name TEXT,
  crime_head_name TEXT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  act_section TEXT,
  io_name TEXT,
  kgid TEXT,
  internal_io TEXT,
  place_of_offence TEXT,
  distance_from_ps TEXT,
  beat_name TEXT,
  village_area_name TEXT,
  male_victims INTEGER DEFAULT 0,
  female_victims INTEGER DEFAULT 0,
  boy_victims INTEGER DEFAULT 0,
  girl_victims INTEGER DEFAULT 0,
  age_0_victims INTEGER DEFAULT 0,
  victim_count INTEGER DEFAULT 0,
  accused_count INTEGER DEFAULT 0,
  arrested_male INTEGER DEFAULT 0,
  arrested_female INTEGER DEFAULT 0,
  arrested_count INTEGER DEFAULT 0,
  accused_chargesheeted INTEGER DEFAULT 0,
  conviction_count INTEGER DEFAULT 0,
  unit_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-FIR link
CREATE TABLE case_firs (
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  fir_id UUID REFERENCES firs(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, fir_id)
);

-- Entities
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FIR', 'District', 'PoliceUnit', 'CrimeGroup', 'CrimeHead', 'Location', 'InvestigatingOfficer', 'ActSection')),
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  fir_id UUID REFERENCES firs(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT,
  sha256_hash TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  integrity_status TEXT DEFAULT 'PENDING' CHECK (integrity_status IN ('VERIFIED', 'COMPROMISED', 'PENDING'))
);

-- Risk assessments
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  fir_id UUID REFERENCES firs(id) ON DELETE SET NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  factors JSONB NOT NULL DEFAULT '[]',
  disclaimer TEXT DEFAULT 'Investigative prioritization only — requires investigator verification.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis runs
CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  fir_id UUID REFERENCES firs(id) ON DELETE SET NULL,
  summary TEXT,
  investigative_leads JSONB DEFAULT '[]',
  important_attributes JSONB DEFAULT '[]',
  analysis_type TEXT DEFAULT 'rule_based',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT,
  case_id TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE firs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_firs ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies (allow anon + authenticated for prototype)
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Public insert cases" ON cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cases" ON cases FOR UPDATE USING (true);
CREATE POLICY "Public read firs" ON firs FOR SELECT USING (true);
CREATE POLICY "Public insert firs" ON firs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read case_firs" ON case_firs FOR SELECT USING (true);
CREATE POLICY "Public insert case_firs" ON case_firs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read entities" ON entities FOR SELECT USING (true);
CREATE POLICY "Public insert entities" ON entities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read relationships" ON relationships FOR SELECT USING (true);
CREATE POLICY "Public insert relationships" ON relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Public CRUD evidence" ON evidence FOR ALL USING (true);
CREATE POLICY "Public read risk" ON risk_assessments FOR SELECT USING (true);
CREATE POLICY "Public insert risk" ON risk_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read analysis" ON analysis_runs FOR SELECT USING (true);
CREATE POLICY "Public insert analysis" ON analysis_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read audit" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert audit" ON audit_logs FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_cases_id ON cases(id);
CREATE INDEX idx_firs_number ON firs(fir_number);
CREATE INDEX idx_entities_case ON entities(case_id);
CREATE INDEX idx_relationships_source ON relationships(source_id);
CREATE INDEX idx_relationships_target ON relationships(target_id);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_audit_case ON audit_logs(case_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Profile for demo
INSERT INTO profiles (id, email, name, role, department, badge_number) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@netra.gov.in', 'Inspector A. Sharma', 'investigator', 'CYBER INTEL DIV', 'NPA-2024-0847');

-- Case
INSERT INTO cases (id, title, status, priority, description, source, created_by) VALUES
  ('CASE-2026-001', 'Operation Nexus', 'Active', 'High',
   'Investigation into theft case reported at Jayamahal Police Station, Bangalore Urban district. Single FIR prototype for NETRA system validation.',
   'Karnataka Police FIR Dataset — 1 Record',
   '00000000-0000-0000-0000-000000000001');

-- FIR
INSERT INTO firs (
  fir_number, district_name, unit_name, fir_year, fir_month, fir_day,
  offence_duration, fir_type, fir_stage, complaint_mode,
  crime_group_name, crime_head_name, latitude, longitude,
  act_section, io_name, kgid, internal_io,
  place_of_offence, distance_from_ps, beat_name, village_area_name,
  male_victims, female_victims, boy_victims, girl_victims, age_0_victims,
  victim_count, accused_count, arrested_male, arrested_female, arrested_count,
  accused_chargesheeted, conviction_count, unit_id
) VALUES (
  'fir-2024-bangalore-001',
  'BANGALORE URBAN',
  'Jayamahal Police Station',
  2024, 3, 15,
  'Between 14:00 and 16:00 hours',
  'Cognizable',
  'Registered',
  'In Person',
  'Theft',
  'Theft - Motor Vehicle',
  12.9949,
  77.5863,
  'Section 379 IPC',
  'Inspector Rajesh Kumar',
  'KGID-10234',
  'IO-BNG-0847',
  'Jayamahal Road, Near Siddapura, Bangalore - 560006',
  '2.5 km',
  'Beat 12 - Jayamahal',
  'Siddapura Village, Bangalore Urban',
  1, 0, 0, 0, 0,
  1, 2, 1, 0, 1,
  0, 0,
  'UNIT-BNG-JM-012'
);

-- Link FIR to case
INSERT INTO case_firs (case_id, fir_id)
SELECT 'CASE-2026-001', id FROM firs WHERE fir_number = 'fir-2024-bangalore-001';

-- Entities
INSERT INTO entities (case_id, type, name, metadata) VALUES
  ('CASE-2026-001', 'FIR', 'FIR-2024-Bangalore-001', '{"fir_number": "fir-2024-bangalore-001", "year": 2024, "month": 3, "day": 15}'),
  ('CASE-2026-001', 'District', 'BANGALORE URBAN', '{"state": "Karnataka", "latitude": 12.9716, "longitude": 77.5946}'),
  ('CASE-2026-001', 'PoliceUnit', 'Jayamahal Police Station', '{"unit_id": "UNIT-BNG-JM-012", "beat": "Beat 12 - Jayamahal"}'),
  ('CASE-2026-001', 'CrimeGroup', 'Theft', '{"category": "Property Crime"}'),
  ('CASE-2026-001', 'CrimeHead', 'Theft - Motor Vehicle', '{"sub_category": "Motor Vehicle Theft"}'),
  ('CASE-2026-001', 'Location', 'Jayamahal Road, Near Siddapura', '{"pincode": "560006", "village": "Siddapura Village", "distance_ps": "2.5 km", "latitude": 12.9949, "longitude": 77.5863}'),
  ('CASE-2026-001', 'InvestigatingOfficer', 'Inspector Rajesh Kumar', '{"kgid": "KGID-10234", "internal_io": "IO-BNG-0847"}'),
  ('CASE-2026-001', 'ActSection', 'Section 379 IPC', '{"description": "Punishment for theft"}');

-- Relationships
INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'OCCURRED_IN', 'FIR occurred in district'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'District' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'INVESTIGATED_BY', 'Investigated by officer'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'InvestigatingOfficer' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_CRIME', 'Crime category'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'CrimeGroup' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_CRIME_HEAD', 'Crime sub-category'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'CrimeHead' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'LOCATED_AT', 'Location of offence'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'Location' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'POLICE_UNIT', 'Handled by unit'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'PoliceUnit' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'CHARGED_UNDER', 'Act section applied'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'ActSection' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_POLICE_UNIT', 'District has unit'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'District' AND e2.type = 'PoliceUnit' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'UNIT_IN', 'Unit located in district'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'PoliceUnit' AND e2.type = 'District' LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'CRIME_OF_TYPE', 'Crime group has head'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'CrimeGroup' AND e2.type = 'CrimeHead' LIMIT 1;

-- Audit logs
INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('CASE_CREATED', 'Inspector A. Sharma', 'CASE-2026-001', 'case', 'CASE-2026-001', '{"title": "Operation Nexus", "source": "Karnataka Police FIR Dataset"}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('FIR_IMPORTED', 'Inspector A. Sharma', 'CASE-2026-001', 'fir', 'fir-2024-bangalore-001', '{"district": "BANGALORE URBAN", "crime": "Theft", "date": "2024-03-15"}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('ENTITIES_EXTRACTED', 'NETRA System', 'CASE-2026-001', 'entities', 'batch', '{"count": 8}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('RELATIONSHIPS_CREATED', 'NETRA System', 'CASE-2026-001', 'relationships', 'batch', '{"count": 10}');
