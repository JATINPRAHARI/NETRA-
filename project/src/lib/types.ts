export type UserRole = 'admin' | 'investigator' | 'supervisor';

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  badge_number: string | null;
  created_at: string;
};

export type CaseStatus = 'Active' | 'Pending' | 'Closed' | 'Archived';
export type CasePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Case = {
  id: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  description: string | null;
  source: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FIR = {
  id: string;
  fir_number: string;
  district_name: string | null;
  unit_name: string | null;
  fir_year: number | null;
  fir_month: number | null;
  fir_day: number | null;
  offence_duration: string | null;
  fir_type: string | null;
  fir_stage: string | null;
  complaint_mode: string | null;
  crime_group_name: string | null;
  crime_head_name: string | null;
  latitude: number | null;
  longitude: number | null;
  act_section: string | null;
  io_name: string | null;
  kgid: string | null;
  internal_io: string | null;
  place_of_offence: string | null;
  distance_from_ps: string | null;
  beat_name: string | null;
  village_area_name: string | null;
  male_victims: number;
  female_victims: number;
  boy_victims: number;
  girl_victims: number;
  age_0_victims: number;
  victim_count: number;
  accused_count: number;
  arrested_male: number;
  arrested_female: number;
  arrested_count: number;
  accused_chargesheeted: number;
  conviction_count: number;
  unit_id: string | null;
  created_at: string;
};

export type EntityType = 'FIR' | 'District' | 'PoliceUnit' | 'CrimeGroup' | 'CrimeHead' | 'Location' | 'InvestigatingOfficer' | 'ActSection';

export type Entity = {
  id: string;
  case_id: string;
  type: EntityType;
  name: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Relationship = {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  label: string | null;
  created_at: string;
};

export type EvidenceRecord = {
  id: string;
  case_id: string;
  fir_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string | null;
  sha256_hash: string;
  uploaded_by: string | null;
  uploaded_at: string;
  integrity_status: 'VERIFIED' | 'COMPROMISED' | 'PENDING';
};

export type RiskAssessment = {
  id: string;
  case_id: string;
  fir_id: string | null;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: { label: string; value: string; impact: number }[];
  disclaimer: string;
  created_at: string;
};

export type AnalysisRun = {
  id: string;
  case_id: string;
  fir_id: string | null;
  summary: string | null;
  investigative_leads: string[];
  important_attributes: { field: string; value: string; reason: string }[];
  analysis_type: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  action: string;
  user_id: string | null;
  user_name: string | null;
  case_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  hash: string | null;
  previous_hash: string | null;
  created_at: string;
};
