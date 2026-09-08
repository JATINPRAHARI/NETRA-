-- NETRA Database Schema
-- Karnataka FIR Prototype - 1 Record

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
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

-- FIR Records (from Karnataka Police Dataset)
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

-- Entities (extracted from FIR)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FIR', 'District', 'PoliceUnit', 'CrimeGroup', 'CrimeHead', 'Location', 'InvestigatingOfficer', 'ActSection')),
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships between entities
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence files
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
  integrity_status TEXT DEFAULT 'VERIFIED' CHECK (integrity_status IN ('VERIFIED', 'COMPROMISED', 'PENDING'))
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

-- Audit logs (immutable)
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

-- Policies
CREATE POLICY "Authenticated read profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read cases" ON cases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert cases" ON cases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read firs" ON firs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read case_firs" ON case_firs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert case_firs" ON case_firs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read entities" ON entities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert entities" ON entities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read relationships" ON relationships FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert relationships" ON relationships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated CRUD evidence" ON evidence FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read risk" ON risk_assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert risk" ON risk_assessments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read analysis" ON analysis_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert analysis" ON analysis_runs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read audit" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert audit" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_cases_id ON cases(id);
CREATE INDEX idx_firs_number ON firs(fir_number);
CREATE INDEX idx_entities_case ON entities(case_id);
CREATE INDEX idx_relationships_source ON relationships(source_id);
CREATE INDEX idx_relationships_target ON relationships(target_id);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_audit_case ON audit_logs(case_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
