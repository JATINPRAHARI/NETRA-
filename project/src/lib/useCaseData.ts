import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getCase, getFIRsByCase, getEntities, getRelationships,
  getRiskAssessment, getAnalysis, getEvidence, getAuditLogs,
} from '@/lib/data';
import { demoStore } from '@/lib/auth';
import type { Case, FIR, Entity, Relationship, RiskAssessment, AnalysisRun, EvidenceRecord, AuditLog } from '@/lib/types';

type CaseData = {
  caseData: Case;
  firs: FIR[];
  fir: FIR;
  entities: Entity[];
  relationships: Relationship[];
  risk: RiskAssessment | null;
  analysis: AnalysisRun | null;
  evidence: EvidenceRecord[];
  auditLogs: AuditLog[];
  loading: boolean;
};

export function useCaseData(): CaseData {
  const { caseId } = useParams();
  const [data, setData] = useState<CaseData>({
    caseData: demoStore.getCase(),
    firs: [demoStore.getFIR()],
    fir: demoStore.getFIR(),
    entities: demoStore.getEntities(),
    relationships: demoStore.getRelationships(),
    risk: demoStore.getRiskAssessment(),
    analysis: demoStore.getAnalysis(),
    evidence: demoStore.getEvidence(),
    auditLogs: demoStore.getAuditLogs(),
    loading: true,
  });

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;

    async function load() {
      try {
        const [caseData, firs, entities, relationships, evidence, auditLogs] = await Promise.all([
          getCase(caseId!),
          getFIRsByCase(caseId!),
          getEntities(caseId!),
          getRelationships(caseId!),
          getEvidence(caseId!),
          getAuditLogs(caseId!),
        ]);

        const fir = firs[0] ?? demoStore.getFIR();

        const [risk, analysis] = await Promise.all([
          getRiskAssessment(caseId!, fir.id),
          getAnalysis(caseId!, fir.id),
        ]);

        if (!cancelled) {
          setData({
            caseData,
            firs,
            fir,
            entities,
            relationships,
            risk,
            analysis,
            evidence,
            auditLogs,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setData(prev => ({ ...prev, loading: false }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [caseId]);

  return data;
}
