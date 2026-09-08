import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEMO_CASE, DEMO_FIR, DEMO_ENTITIES, DEMO_RELATIONSHIPS,
  DEMO_RISK, DEMO_ANALYSIS, DEMO_PROFILE,
  demoStore,
} from '@/lib/demo-data';
import type { Case, FIR, Entity, Relationship, RiskAssessment, AnalysisRun, AuditLog, EvidenceRecord, Profile } from '@/lib/types';
import { calculateRiskScore } from '@/lib/risk';
import { analyzeFIR } from '@/lib/analysis';

export async function getProfile(email: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return DEMO_PROFILE;
  const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
  return data ?? DEMO_PROFILE;
}

export async function getCase(caseId: string): Promise<Case> {
  if (!isSupabaseConfigured) return DEMO_CASE;
  const { data } = await supabase.from('cases').select('*').eq('id', caseId).single();
  return data ?? DEMO_CASE;
}

export async function getCases(): Promise<Case[]> {
  if (!isSupabaseConfigured) return [DEMO_CASE];
  const { data } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
  return data ?? [DEMO_CASE];
}

export async function getFIR(firId: string): Promise<FIR> {
  if (!isSupabaseConfigured) return DEMO_FIR;
  const { data } = await supabase.from('firs').select('*').eq('id', firId).single();
  return data ?? DEMO_FIR;
}

export async function getFIRsByCase(caseId: string): Promise<FIR[]> {
  if (!isSupabaseConfigured) return [DEMO_FIR];
  const { data: links } = await supabase.from('case_firs').select('fir_id').eq('case_id', caseId);
  if (!links || links.length === 0) return [DEMO_FIR];
  const firIds = links.map(l => l.fir_id);
  const { data } = await supabase.from('firs').select('*').in('id', firIds);
  return data ?? [DEMO_FIR];
}

export async function getFIRByNumber(firNumber: string): Promise<FIR | null> {
  if (!isSupabaseConfigured) return DEMO_FIR;
  const { data } = await supabase.from('firs').select('*').eq('fir_number', firNumber).single();
  return data ?? DEMO_FIR;
}

export async function getEntities(caseId: string): Promise<Entity[]> {
  if (!isSupabaseConfigured) return DEMO_ENTITIES;
  const { data } = await supabase.from('entities').select('*').eq('case_id', caseId).order('created_at');
  return data ?? DEMO_ENTITIES;
}

export async function getRelationships(caseId: string): Promise<Relationship[]> {
  if (!isSupabaseConfigured) return DEMO_RELATIONSHIPS;
  const { data: entities } = await supabase.from('entities').select('id').eq('case_id', caseId);
  if (!entities || entities.length === 0) return DEMO_RELATIONSHIPS;
  const entityIds = entities.map(e => e.id);
  const { data } = await supabase
    .from('relationships')
    .select('*')
    .or(`source_id.in.(${entityIds.join(',')}),target_id.in.(${entityIds.join(',')})`);
  return data ?? DEMO_RELATIONSHIPS;
}

export async function getRiskAssessment(caseId: string, firId: string): Promise<RiskAssessment> {
  if (!isSupabaseConfigured) return DEMO_RISK;
  const { data } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('case_id', caseId)
    .eq('fir_id', firId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data ?? DEMO_RISK;
}

export async function getAnalysis(caseId: string, firId: string): Promise<AnalysisRun> {
  if (!isSupabaseConfigured) return DEMO_ANALYSIS;
  const { data } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('case_id', caseId)
    .eq('fir_id', firId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data ?? DEMO_ANALYSIS;
}

export async function getEvidence(caseId: string): Promise<EvidenceRecord[]> {
  if (!isSupabaseConfigured) return demoStore.getEvidence();
  const { data } = await supabase
    .from('evidence')
    .select('*')
    .eq('case_id', caseId)
    .order('uploaded_at', { ascending: false });
  return data ?? [];
}

export async function addEvidence(record: EvidenceRecord): Promise<void> {
  if (!isSupabaseConfigured) { demoStore.addEvidence(record); return; }
  await supabase.from('evidence').insert(record);
}

export async function verifyEvidence(id: string): Promise<EvidenceRecord | null> {
  if (!isSupabaseConfigured) return demoStore.verifyEvidence(id);
  await supabase.from('evidence').update({ integrity_status: 'VERIFIED' }).eq('id', id);
  const { data } = await supabase.from('evidence').select('*').eq('id', id).single();
  return data;
}

export async function getAuditLogs(caseId: string): Promise<AuditLog[]> {
  if (!isSupabaseConfigured) return demoStore.getAuditLogs();
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function addAuditLog(entry: Omit<AuditLog, 'id' | 'hash' | 'previous_hash' | 'created_at'>): Promise<void> {
  if (!isSupabaseConfigured) {
    demoStore.addAuditLog?.(entry);
    return;
  }
  await supabase.from('audit_logs').insert({
    ...entry,
    created_at: new Date().toISOString(),
  });
}

export async function runAnalysis(caseId: string, fir: FIR): Promise<AnalysisRun> {
  const result = analyzeFIR(fir);
  const record = { ...result, case_id: caseId, fir_id: fir.id };

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('analysis_runs').insert(record).select().single();
    await addAuditLog({
      action: 'ANALYSIS_STARTED',
      user_id: null,
      user_name: 'NETRA System',
      case_id: caseId,
      resource_type: 'analysis',
      resource_id: data?.id ?? '',
      details: { type: 'rule_based' },
    });
    return data ?? { ...record, id: '', created_at: new Date().toISOString() };
  }

  return demoStore.runAnalysis();
}

export async function runRiskAssessment(caseId: string, fir: FIR): Promise<RiskAssessment> {
  const result = calculateRiskScore(fir);
  const record = { ...result, case_id: caseId, fir_id: fir.id };

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('risk_assessments').insert(record).select().single();
    return data ?? { ...record, id: '', created_at: new Date().toISOString() };
  }

  return demoStore.runRiskAssessment();
}

export async function generateReport(caseId: string): Promise<string> {
  if (!isSupabaseConfigured) return demoStore.generateReport();
  const caseData = await getCase(caseId);
  const firs = await getFIRsByCase(caseId);
  const risk = firs[0] ? await getRiskAssessment(caseId, firs[0].id) : null;
  const analysis = firs[0] ? await getAnalysis(caseId, firs[0].id) : null;
  const evidenceItems = await getEvidence(caseId);
  const audit = await getAuditLogs(caseId);
  const fir = firs[0] ?? DEMO_FIR;

  await addAuditLog({
    action: 'REPORT_GENERATED',
    user_id: null,
    user_name: 'Inspector A. Sharma',
    case_id: caseId,
    resource_type: 'report',
    resource_id: `rpt-${Date.now()}`,
    details: { format: 'text' },
  });

  return `
NETRA — INVESTIGATION REPORT
Generated: ${new Date().toISOString()}
Case: ${caseData.id} — ${caseData.title}
Priority: ${caseData.priority} | Status: ${caseData.status}
Source: ${caseData.source}

FIR Number: ${fir.fir_number}
Crime: ${fir.crime_group_name} — ${fir.crime_head_name}
District: ${fir.district_name}
Date: ${fir.fir_day}/${fir.fir_month}/${fir.fir_year}
IO: ${fir.io_name}

Risk Score: ${risk?.risk_score ?? 0}/100 (${risk?.risk_level ?? 'N/A'})
${risk?.factors?.map(f => `  ${f.label}: ${f.value} (+${f.impact})`).join('\n') ?? ''}

Analysis: ${analysis?.summary ?? 'N/A'}
Leads: ${analysis?.investigative_leads?.length ?? 0}
Evidence: ${evidenceItems.length} files
Audit Events: ${audit.length}
  `.trim();
}
