import type { Profile, Case, FIR, Entity, Relationship, EvidenceRecord, RiskAssessment, AnalysisRun, AuditLog } from './types';
import { calculateRiskScore } from './risk';
import { analyzeFIR } from './analysis';

// ============================================================
// DEMO DATA - One FIR from Karnataka Police Dataset
// Source: https://www.kaggle.com/datasets/vanshangaria/fir-details-karnataka-police
// ============================================================

export const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@netra.gov.in',
  name: 'Inspector A. Sharma',
  role: 'investigator',
  department: 'CYBER INTEL DIV',
  badge_number: 'NPA-2024-0847',
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_CASE: Case = {
  id: 'CASE-2026-001',
  title: 'Operation Nexus',
  status: 'Active',
  priority: 'High',
  description: 'Investigation into theft case reported at Jayamahal Police Station, Bangalore Urban district.',
  source: 'Karnataka Police',
  created_by: '00000000-0000-0000-0000-000000000001',
  created_at: '2026-08-15T10:00:00Z',
  updated_at: '2026-08-15T10:00:00Z',
};

export const DEMO_FIR: FIR = {
  id: 'fir-2024-bangalore-001',
  fir_number: 'fir-2024-bangalore-001',
  district_name: 'BANGALORE URBAN',
  unit_name: 'Jayamahal Police Station',
  fir_year: 2024,
  fir_month: 3,
  fir_day: 15,
  offence_duration: 'Between 14:00 and 16:00 hours',
  fir_type: 'Cognizable',
  fir_stage: 'Registered',
  complaint_mode: 'In Person',
  crime_group_name: 'Theft',
  crime_head_name: 'Theft - Motor Vehicle',
  latitude: 12.9949,
  longitude: 77.5863,
  act_section: 'Section 379 IPC',
  io_name: 'Inspector Rajesh Kumar',
  kgid: 'KGID-10234',
  internal_io: 'IO-BNG-0847',
  place_of_offence: 'Jayamahal Road, Near Siddapura, Bangalore - 560006',
  distance_from_ps: '2.5 km',
  beat_name: 'Beat 12 - Jayamahal',
  village_area_name: 'Siddapura Village, Bangalore Urban',
  male_victims: 1,
  female_victims: 0,
  boy_victims: 0,
  girl_victims: 0,
  age_0_victims: 0,
  victim_count: 1,
  accused_count: 2,
  arrested_male: 1,
  arrested_female: 0,
  arrested_count: 1,
  accused_chargesheeted: 0,
  conviction_count: 0,
  unit_id: 'UNIT-BNG-JM-012',
  created_at: '2026-08-15T10:00:00Z',
};

let _entityIdCounter = 1;
function eid(): string { return `entity-${String(_entityIdCounter++).padStart(3, '0')}`; }

const e1 = eid(), e2 = eid(), e3 = eid(), e4 = eid(), e5 = eid(), e6 = eid(), e7 = eid(), e8 = eid();

export const DEMO_ENTITIES: Entity[] = [
  { id: e1, case_id: 'CASE-2026-001', type: 'FIR', name: 'FIR-2024-Bangalore-001', metadata: { fir_number: 'fir-2024-bangalore-001', year: 2024, month: 3, day: 15 }, created_at: '2026-08-15T10:00:00Z' },
  { id: e2, case_id: 'CASE-2026-001', type: 'District', name: 'BANGALORE URBAN', metadata: { state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 }, created_at: '2026-08-15T10:00:00Z' },
  { id: e3, case_id: 'CASE-2026-001', type: 'PoliceUnit', name: 'Jayamahal Police Station', metadata: { unit_id: 'UNIT-BNG-JM-012', beat: 'Beat 12 - Jayamahal' }, created_at: '2026-08-15T10:00:00Z' },
  { id: e4, case_id: 'CASE-2026-001', type: 'CrimeGroup', name: 'Theft', metadata: { category: 'Property Crime' }, created_at: '2026-08-15T10:00:00Z' },
  { id: e5, case_id: 'CASE-2026-001', type: 'CrimeHead', name: 'Theft - Motor Vehicle', metadata: { sub_category: 'Motor Vehicle Theft' }, created_at: '2026-08-15T10:00:00Z' },
  { id: e6, case_id: 'CASE-2026-001', type: 'Location', name: 'Jayamahal Road, Near Siddapura', metadata: { pincode: '560006', village: 'Siddapura Village', distance_ps: '2.5 km', latitude: 12.9949, longitude: 77.5863 }, created_at: '2026-08-15T10:00:00Z' },
  { id: e7, case_id: 'CASE-2026-001', type: 'InvestigatingOfficer', name: 'Inspector Rajesh Kumar', metadata: { kgid: 'KGID-10234', internal_io: 'IO-BNG-0847' }, created_at: '2026-08-15T10:00:00Z' },
  { id: e8, case_id: 'CASE-2026-001', type: 'ActSection', name: 'Section 379 IPC', metadata: { description: 'Punishment for theft' }, created_at: '2026-08-15T10:00:00Z' },
];

let _relIdCounter = 1;
function rid(): string { return `rel-${String(_relIdCounter++).padStart(3, '0')}`; }

export const DEMO_RELATIONSHIPS: Relationship[] = [
  { id: rid(), source_id: e1, target_id: e2, type: 'OCCURRED_IN', label: 'FIR occurred in district', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e7, type: 'INVESTIGATED_BY', label: 'Investigated by officer', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e4, type: 'HAS_CRIME', label: 'Crime category', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e5, type: 'HAS_CRIME_HEAD', label: 'Crime sub-category', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e6, type: 'LOCATED_AT', label: 'Location of offence', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e3, type: 'POLICE_UNIT', label: 'Handled by unit', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e1, target_id: e8, type: 'CHARGED_UNDER', label: 'Act section applied', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e2, target_id: e3, type: 'HAS_POLICE_UNIT', label: 'District has unit', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e3, target_id: e2, type: 'UNIT_IN', label: 'Unit located in district', created_at: '2026-08-15T10:00:00Z' },
  { id: rid(), source_id: e4, target_id: e5, type: 'CRIME_OF_TYPE', label: 'Crime group has head', created_at: '2026-08-15T10:00:00Z' },
];

export const DEMO_RISK: RiskAssessment = (() => {
  const r = calculateRiskScore(DEMO_FIR);
  r.id = 'risk-001';
  r.case_id = 'CASE-2026-001';
  r.fir_id = 'fir-2024-bangalore-001';
  return r;
})();

export const DEMO_ANALYSIS: AnalysisRun = (() => {
  const a = analyzeFIR(DEMO_FIR);
  return { ...a, id: 'analysis-001', created_at: '2026-08-15T10:05:00Z' };
})();

// ============================================================
// IN-MEMORY DEMO STORE
// ============================================================

class DemoStore {
  private evidence: EvidenceRecord[] = [];
  private auditLogs: AuditLog[] = [
    {
      id: 'audit-001', action: 'CASE_CREATED', user_id: null, user_name: 'Inspector A. Sharma',
      case_id: 'CASE-2026-001', resource_type: 'case', resource_id: 'CASE-2026-001',
      details: { title: 'Operation Nexus', source: 'Karnataka Police' },
      hash: null, previous_hash: null, created_at: '2026-08-15T10:00:00Z',
    },
    {
      id: 'audit-002', action: 'FIR_IMPORTED', user_id: null, user_name: 'Inspector A. Sharma',
      case_id: 'CASE-2026-001', resource_type: 'fir', resource_id: 'fir-2024-bangalore-001',
      details: { district: 'BANGALORE URBAN', crime: 'Theft', date: '2024-03-15' },
      hash: null, previous_hash: 'audit-001', created_at: '2026-08-15T10:00:01Z',
    },
    {
      id: 'audit-003', action: 'ENTITIES_EXTRACTED', user_id: null, user_name: 'NETRA System',
      case_id: 'CASE-2026-001', resource_type: 'entities', resource_id: 'batch',
      details: { count: 8, types: ['FIR', 'District', 'PoliceUnit', 'CrimeGroup', 'CrimeHead', 'Location', 'InvestigatingOfficer', 'ActSection'] },
      hash: null, previous_hash: 'audit-002', created_at: '2026-08-15T10:00:02Z',
    },
    {
      id: 'audit-004', action: 'RELATIONSHIPS_CREATED', user_id: null, user_name: 'NETRA System',
      case_id: 'CASE-2026-001', resource_type: 'relationships', resource_id: 'batch',
      details: { count: 10 },
      hash: null, previous_hash: 'audit-003', created_at: '2026-08-15T10:00:03Z',
    },
  ];
  private riskAssessment: RiskAssessment | null = null;
  private analysis: AnalysisRun | null = null;
  private auditIdCounter = 5;

  getProfile(): Profile { return DEMO_PROFILE; }
  getCase(): Case { return DEMO_CASE; }
  getFIR(): FIR { return DEMO_FIR; }
  getEntities(): Entity[] { return DEMO_ENTITIES; }
  getRelationships(): Relationship[] { return DEMO_RELATIONSHIPS; }

  getEvidence(): EvidenceRecord[] { return [...this.evidence]; }

  getRiskAssessment(): RiskAssessment | null { return this.riskAssessment ?? DEMO_RISK; }
  getAnalysis(): AnalysisRun | null { return this.analysis ?? DEMO_ANALYSIS; }
  getAuditLogs(): AuditLog[] { return [...this.auditLogs].sort((a, b) => b.created_at.localeCompare(a.created_at)); }

  addEvidence(ev: EvidenceRecord): void {
    this.evidence.push(ev);
    this.addAuditLog({
      action: 'EVIDENCE_UPLOADED', user_id: null, user_name: 'Inspector A. Sharma',
      case_id: 'CASE-2026-001', resource_type: 'evidence', resource_id: ev.id,
      details: { file_name: ev.file_name, file_type: ev.file_type, sha256: ev.sha256_hash },
    });
  }

  verifyEvidence(id: string): EvidenceRecord | null {
    const ev = this.evidence.find(e => e.id === id);
    if (ev) {
      ev.integrity_status = 'VERIFIED';
      this.addAuditLog({
        action: 'EVIDENCE_VERIFIED', user_id: null, user_name: 'Inspector A. Sharma',
        case_id: 'CASE-2026-001', resource_type: 'evidence', resource_id: id,
        details: { file_name: ev.file_name, status: 'VERIFIED' },
      });
    }
    return ev ?? null;
  }

  runAnalysis(): AnalysisRun {
    this.analysis = { ...DEMO_ANALYSIS, id: `analysis-${Date.now()}`, created_at: new Date().toISOString() };
    this.addAuditLog({
      action: 'ANALYSIS_STARTED', user_id: null, user_name: 'Inspector A. Sharma',
      case_id: 'CASE-2026-001', resource_type: 'analysis', resource_id: this.analysis.id,
      details: { type: 'rule_based' },
    });
    this.addAuditLog({
      action: 'ANALYSIS_COMPLETED', user_id: null, user_name: 'NETRA System',
      case_id: 'CASE-2026-001', resource_type: 'analysis', resource_id: this.analysis.id,
      details: { leads: this.analysis.investigative_leads.length, attributes: this.analysis.important_attributes.length },
    });
    return this.analysis;
  }

  runRiskAssessment(): RiskAssessment {
    this.riskAssessment = { ...DEMO_RISK, id: `risk-${Date.now()}`, created_at: new Date().toISOString() };
    return this.riskAssessment;
  }

  generateReport(): string {
    this.addAuditLog({
      action: 'REPORT_GENERATED', user_id: null, user_name: 'Inspector A. Sharma',
      case_id: 'CASE-2026-001', resource_type: 'report', resource_id: `rpt-${Date.now()}`,
      details: { format: 'text' },
    });
    const fir = DEMO_FIR;
    const risk = this.getRiskAssessment()!;
    const analysis = this.getAnalysis()!;
    const evidence = this.getEvidence();
    const audit = this.getAuditLogs();

    return `
═══════════════════════════════════════════════════════════════
                    NETRA — INVESTIGATION REPORT
                  Criminal Intelligence Platform
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toISOString()}
Case: ${DEMO_CASE.id} — ${DEMO_CASE.title}
Priority: ${DEMO_CASE.priority} | Status: ${DEMO_CASE.status}
Source: ${DEMO_CASE.source}

───────────────────────────────────────────────────────────────
                     CASE INFORMATION
───────────────────────────────────────────────────────────────
Case ID:          ${DEMO_CASE.id}
Case Title:       ${DEMO_CASE.title}
Status:           ${DEMO_CASE.status}
Priority:         ${DEMO_CASE.priority}
Description:      ${DEMO_CASE.description}
Source:           ${DEMO_CASE.source}

───────────────────────────────────────────────────────────────
                      FIR INFORMATION
───────────────────────────────────────────────────────────────
FIR Number:       ${fir.fir_number}
FIR Type:         ${fir.fir_type || 'Not Available'}
FIR Stage:        ${fir.fir_stage || 'Not Available'}
Complaint Mode:   ${fir.complaint_mode || 'Not Available'}
Duration:         ${fir.offence_duration || 'Not Available'}

───────────────────────────────────────────────────────────────
                     CRIME INFORMATION
───────────────────────────────────────────────────────────────
Crime Group:      ${fir.crime_group_name || 'Not Available'}
Crime Head:       ${fir.crime_head_name || 'Not Available'}
Act/Section:      ${fir.act_section || 'Not Available'}

───────────────────────────────────────────────────────────────
                       LOCATION
───────────────────────────────────────────────────────────────
District:         ${fir.district_name || 'Not Available'}
Place of Offence: ${fir.place_of_offence || 'Not Available'}
Village/Area:     ${fir.village_area_name || 'Not Available'}
Beat:             ${fir.beat_name || 'Not Available'}
Distance from PS: ${fir.distance_from_ps || 'Not Available'}
Coordinates:      ${fir.latitude && fir.longitude ? `${fir.latitude}, ${fir.longitude}` : 'Not Available'}

───────────────────────────────────────────────────────────────
                   VICTIM INFORMATION
───────────────────────────────────────────────────────────────
Total Victims:    ${fir.victim_count}
Male:             ${fir.male_victims}
Female:           ${fir.female_victims}
Boy:              ${fir.boy_victims}
Girl:             ${fir.girl_victims}
Age 0:            ${fir.age_0_victims}

───────────────────────────────────────────────────────────────
                   ACCUSED INFORMATION
───────────────────────────────────────────────────────────────
Total Accused:    ${fir.accused_count}
Arrested Male:    ${fir.arrested_male}
Arrested Female:  ${fir.arrested_female}
Total Arrested:   ${fir.arrested_count}
Chargesheeted:    ${fir.accused_chargesheeted}
Convictions:      ${fir.conviction_count}

───────────────────────────────────────────────────────────────
               INVESTIGATION INFORMATION
───────────────────────────────────────────────────────────────
Investigating IO: ${fir.io_name || 'Not Available'}
KGID:             ${fir.kgid || 'Not Available'}
Internal IO:      ${fir.internal_io || 'Not Available'}
Unit:             ${fir.unit_name || 'Not Available'}
Unit ID:          ${fir.unit_id || 'Not Available'}
Year:             ${fir.fir_year || 'Not Available'}
Month:            ${fir.fir_month || 'Not Available'}
Day:              ${fir.fir_day || 'Not Available'}

───────────────────────────────────────────────────────────────
                   RISK ASSESSMENT
───────────────────────────────────────────────────────────────
Risk Score:       ${risk.risk_score}/100
Risk Level:       ${risk.risk_level}
${risk.factors.map(f => `  • ${f.label}: ${f.value} (+${f.impact})`).join('\n')}

${risk.disclaimer}

───────────────────────────────────────────────────────────────
               AI/RULE-BASED ANALYSIS
───────────────────────────────────────────────────────────────
${analysis.summary}

Investigative Leads:
${analysis.investigative_leads.map((l, i) => `  ${i + 1}. ${l}`).join('\n')}

Important Attributes:
${analysis.important_attributes.map(a => `  • ${a.field}: ${a.value} — ${a.reason}`).join('\n')}

───────────────────────────────────────────────────────────────
                      EVIDENCE
───────────────────────────────────────────────────────────────
${evidence.length === 0 ? 'No evidence uploaded.' : evidence.map(ev => `File: ${ev.file_name}
  Type: ${ev.file_type} | Size: ${ev.file_size} bytes
  SHA-256: ${ev.sha256_hash}
  Status: ${ev.integrity_status}
  Uploaded: ${ev.uploaded_at}`).join('\n\n')}

───────────────────────────────────────────────────────────────
                    AUDIT SUMMARY
───────────────────────────────────────────────────────────────
Total Events: ${audit.length}
${audit.slice(0, 10).map(a => `  [${a.created_at}] ${a.action} by ${a.user_name}`).join('\n')}

═══════════════════════════════════════════════════════════════
  NETRA is an investigative decision-support prototype.
  Results are analytical leads and require verification by
  authorized investigators.
  
  Data Source: Karnataka Police
  Decision-support tool for investigators
═══════════════════════════════════════════════════════════════
`.trim();
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'hash' | 'previous_hash' | 'created_at'>): void {
    const prev = this.auditLogs[this.auditLogs.length - 1];
    this.auditLogs.push({
      ...entry,
      id: `audit-${String(this.auditIdCounter++).padStart(3, '0')}`,
      hash: null,
      previous_hash: prev?.id ?? null,
      created_at: new Date().toISOString(),
    });
  }
}

export const demoStore = new DemoStore();
