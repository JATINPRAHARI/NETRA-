import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';

type CaseRecord = {
  id: string;
  title: string;
  investigator: string;
  status: 'ACTIVE' | 'UNDER REVIEW' | 'CLOSED';
  priority: number;
  entities: number;
  alerts: number;
  opened: string;
};

const DEMO_CASES: CaseRecord[] = [
  { id: 'CASE-1024', title: 'Operation Netra', investigator: 'Officer R. Malhotra', status: 'ACTIVE', priority: 82, entities: 43, alerts: 5, opened: '2026-08-02' },
  { id: 'CASE-0987', title: 'Sector 18 Financial Fraud Ring', investigator: 'Officer P. Iyer', status: 'ACTIVE', priority: 67, entities: 21, alerts: 2, opened: '2026-07-14' },
  { id: 'CASE-0951', title: 'East Zone Vehicle Theft Network', investigator: 'Officer S. Bano', status: 'UNDER REVIEW', priority: 44, entities: 16, alerts: 1, opened: '2026-06-30' },
  { id: 'CASE-0902', title: 'Cross-border Communication Cluster', investigator: 'Officer R. Malhotra', status: 'CLOSED', priority: 21, entities: 38, alerts: 0, opened: '2026-05-11' },
];

const STATUS_COLORS: Record<string, string> = {
  'ACTIVE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'UNDER REVIEW': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'CLOSED': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function CaseManagement() {
  const { caseData } = useAuth();
  const [compareA, setCompareA] = useState(DEMO_CASES[0].id);
  const [compareB, setCompareB] = useState(DEMO_CASES[1].id);

  return (
    <Layout caseId={caseData.id}>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Case Management</h1>
          <p className="text-xs text-gray-500">Each case is an isolated investigation workspace: entities, documents, graph, timeline, and reports.</p>
        </div>
        <button className="px-4 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] font-medium text-xs rounded-xl transition-all duration-200 border border-[var(--accent)]/20 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">add</span>
          NEW CASE
        </button>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Cases Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Case ID</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Title</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Investigator</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Priority</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entities</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Alerts</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {DEMO_CASES.map((c, i) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="px-5 py-3 text-xs font-mono text-[var(--accent)]">{c.id}</td>
                    <td className="px-5 py-3 text-xs font-medium text-gray-300">{c.title}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{c.investigator}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-300">{c.priority}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{c.entities}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{c.alerts}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{c.opened}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compare Cases */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Compare Cases</h2>
            <span className="text-[10px] text-gray-500">side-by-side network stats + likely shared entities</span>
          </div>
          <div className="space-y-3">
            <select value={compareA} onChange={e => setCompareA(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs font-mono border border-white/[0.06] bg-white/[0.03] text-gray-300 focus:outline-none focus:border-[var(--accent)]/30">
              {DEMO_CASES.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
            </select>
            <p className="text-[10px] text-gray-500 text-center">vs</p>
            <select value={compareB} onChange={e => setCompareB(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs font-mono border border-white/[0.06] bg-white/[0.03] text-gray-300 focus:outline-none focus:border-[var(--accent)]/30">
              {DEMO_CASES.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
            </select>
            <button className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
              COMPARE
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
