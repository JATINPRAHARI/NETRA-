-- NETRA Seed Data - One FIR from Karnataka Police Dataset
-- Source: https://www.kaggle.com/datasets/vanshangaria/fir-details-karnataka-police

-- Profile for demo
INSERT INTO profiles (id, email, name, role, department, badge_number) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@netra.gov.in', 'Inspector A. Sharma', 'investigator', 'CYBER INTEL DIV', 'NPA-2024-0847');

-- Case: Operation Nexus
INSERT INTO cases (id, title, status, priority, description, source, created_by) VALUES
  ('CASE-2026-001', 'Operation Nexus', 'Active', 'High',
   'Investigation into theft case reported at Jayamahal Police Station, Bangalore Urban district. Single FIR prototype for NETRA system validation.',
   'Karnataka Police FIR Dataset — 1 Record',
   '00000000-0000-0000-0000-000000000001');

-- ONE FIR from the Karnataka Police Dataset
-- This is a real record structure from the dataset
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

-- Entities extracted from FIR
INSERT INTO entities (case_id, type, name, metadata) VALUES
  ('CASE-2026-001', 'FIR', 'FIR-2024-Bangalore-001', '{"fir_number": "fir-2024-bangalore-001", "year": 2024, "month": 3, "day": 15}'),
  ('CASE-2026-001', 'District', 'BANGALORE URBAN', '{"state": "Karnataka", "latitude": 12.9716, "longitude": 77.5946}'),
  ('CASE-2026-001', 'PoliceUnit', 'Jayamahal Police Station', '{"unit_id": "UNIT-BNG-JM-012", "beat": "Beat 12 - Jayamahal"}'),
  ('CASE-2026-001', 'CrimeGroup', 'Theft', '{"category": "Property Crime"}'),
  ('CASE-2026-001', 'CrimeHead', 'Theft - Motor Vehicle', '{"sub_category": "Motor Vehicle Theft"}'),
  ('CASE-2026-001', 'Location', 'Jayamahal Road, Near Siddapura', '{"pincode": "560006", "village": "Siddapura Village", "distance_ps": "2.5 km", "latitude": 12.9949, "longitude": 77.5863}'),
  ('CASE-2026-001', 'InvestigatingOfficer', 'Inspector Rajesh Kumar', '{"kgid": "KGID-10234", "internal_io": "IO-BNG-0847"}'),
  ('CASE-2026-001', 'ActSection', 'Section 379 IPC', '{"description": "Punishment for theft"}');

-- Relationships from FIR
INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'OCCURRED_IN', 'FIR occurred in district'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'District'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'INVESTIGATED_BY', 'Investigated by officer'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'InvestigatingOfficer'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_CRIME', 'Crime category'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'CrimeGroup'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_CRIME_HEAD', 'Crime sub-category'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'CrimeHead'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'LOCATED_AT', 'Location of offence'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'Location'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'POLICE_UNIT', 'Handled by unit'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'PoliceUnit'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'CHARGED_UNDER', 'Act section applied'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'FIR' AND e2.type = 'ActSection'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'HAS_POLICE_UNIT', 'District has unit'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'District' AND e2.type = 'PoliceUnit'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'UNIT_IN', 'Unit located in district'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'PoliceUnit' AND e2.type = 'District'
LIMIT 1;

INSERT INTO relationships (source_id, target_id, type, label)
SELECT e1.id, e2.id, 'CRIME_OF_TYPE', 'Crime group has head'
FROM entities e1 JOIN entities e2 ON e1.case_id = e2.case_id
WHERE e1.case_id = 'CASE-2026-001' AND e1.type = 'CrimeGroup' AND e2.type = 'CrimeHead'
LIMIT 1;

-- Initial audit log
INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('CASE_CREATED', 'Inspector A. Sharma', 'CASE-2026-001', 'case', 'CASE-2026-001', '{"title": "Operation Nexus", "source": "Karnataka Police FIR Dataset"}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('FIR_IMPORTED', 'Inspector A. Sharma', 'CASE-2026-001', 'fir', 'fir-2024-bangalore-001', '{"district": "BANGALORE URBAN", "crime": "Theft", "date": "2024-03-15"}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('ENTITIES_EXTRACTED', 'NETRA System', 'CASE-2026-001', 'entities', 'batch', '{"count": 8, "types": ["FIR", "District", "PoliceUnit", "CrimeGroup", "CrimeHead", "Location", "InvestigatingOfficer", "ActSection"]}');

INSERT INTO audit_logs (action, user_name, case_id, resource_type, resource_id, details)
VALUES ('RELATIONSHIPS_CREATED', 'NETRA System', 'CASE-2026-001', 'relationships', 'batch', '{"count": 10}');
