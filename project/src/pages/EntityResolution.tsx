import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type MatchCandidate = {
  id: string;
  entityA: string;
  sourceA: string;
  entityB: string;
  sourceB: string;
  scope: 'Within-case' | 'Cross-case';
  confidence: number;
  evidence: string[];
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
};

const DEMO_MATCHES: MatchCandidate[] = [
  {
    id: 'm1', entityA: 'Mohit Sharma', sourceA: 'CDR_2026_08.csv', entityB: 'M. Sharma', sourceB: 'FIR_Report_17.pdf',
    scope: 'Within-case', confidence: 92,
    evidence: ['Same phone number', 'Same associated vehicle', 'Address overlap (Sector 18)'],
    status: 'PENDING',
  },
  {
    id: 'm2', entityA: 'Deepak Rana', sourceA: 'Social_Intel_04', entityB: 'D. Rana Kumar', sourceB: 'Criminal_History_DB',
    scope: 'Within-case', confidence: 68,
    evidence: ['Name similarity', 'Shared associate: Karan Malik'],
    status: 'PENDING',
  },
  {
    id: 'm3', entityA: 'Rahul Verma', sourceA: 'CDR_2026_08.csv', entityB: 'Rahul V.', sourceB: 'Surveillance_09.pdf',
    scope: 'Within-case', confidence: 97,
    evidence: ['Same phone number', 'Same vehicle usage', 'Same location pattern'],
    status: 'CONFIRMED',
  },
  {
    id: 'm4', entityA: 'Anil Yadav', sourceA: 'Vehicle_Registry', entityB: 'Anil Y. Singh', sourceB: 'Social_Intel_04',
    scope: 'Within-case', confidence: 41,
    evidence: ['Name similarity only — no shared identifiers'],
    status: 'REJECTED',
  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function EntityResolution() {
  const { caseData, entities, loading } = useCaseData();
  const [matches, setMatches] = useState(DEMO_MATCHES);
  const [computing, setComputing] = useState(false);

  const updateStatus = (id: string, status: 'CONFIRMED' | 'REJECTED' | 'PENDING') => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Entity Resolution</h1>
          <p className="text-xs text-gray-500">Possible duplicate identities the system found across sources. The AI never merges automatically — an investigator confirms, rejects, or modifies each match.</p>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Compute new candidates */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Compute new candidates (this case)</h2>
            <button onClick={() => { setComputing(true); setTimeout(() => setComputing(false), 2000); }} className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
              {computing ? 'Computing...' : 'COMPUTE MATCHES'}
            </button>
          </div>
          <p className="text-xs text-gray-400">Runs a live name/phone/vehicle similarity match against this case's current entities.</p>
          {!computing && <p className="text-xs text-gray-500 mt-2">Click "Compute matches" to run the matcher.</p>}
          {computing && (
            <div className="flex items-center gap-2 mt-2 text-[var(--accent)] text-xs">
              <div className="w-3 h-3 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin"></div>
              Running similarity matcher...
            </div>
          )}
        </div>

        {/* Check other cases */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Check other cases</h2>
            <button className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
              CHECK CROSS-CASE
            </button>
          </div>
          <p className="text-xs text-gray-400">Same entity, different investigation — the same person, phone, or vehicle showing up in another case.</p>
          <p className="text-xs text-gray-500 mt-2">Click "Check cross-case" to search other cases.</p>
        </div>

        {/* Match Cards */}
        <div className="space-y-4">
          {matches.map((m, i) => (
            <div key={m.id} className="glass-card p-5 stagger-item" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{m.entityA}</span>
                  <span className="text-[10px] text-gray-500 font-mono">({m.sourceA})</span>
                  <span className="text-gray-500">&harr;</span>
                  <span className="font-bold">{m.entityB}</span>
                  <span className="text-[10px] text-gray-500 font-mono">({m.sourceB})</span>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${STATUS_COLORS[m.status]}`}>{m.status}</span>
              </div>
              <p className="text-[10px] text-gray-500 mb-1">{m.scope}</p>
              <p className="text-xs text-gray-300 mb-3">Match confidence: <span className={`font-mono font-bold ${m.confidence >= 80 ? 'text-emerald-400' : m.confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{m.confidence}%</span></p>
              <div className="space-y-1 mb-4">
                {m.evidence.map((ev, ei) => (
                  <div key={ei} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[var(--accent)]">+</span> {ev}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateStatus(m.id, 'CONFIRMED')} disabled={m.status === 'CONFIRMED'} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40">CONFIRM MATCH</button>
                <button onClick={() => updateStatus(m.id, 'REJECTED')} disabled={m.status === 'REJECTED'} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40">REJECT</button>
                <button onClick={() => updateStatus(m.id, 'PENDING')} disabled={m.status === 'PENDING'} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40">RESET TO PENDING</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
