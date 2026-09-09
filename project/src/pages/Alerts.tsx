import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type Alert = {
  id: string;
  title: string;
  category: string;
  description: string;
  timestamp: string;
  severity: 'High' | 'Medium' | 'Low';
};

const DEMO_ALERTS: Alert[] = [
  { id: 'a1', title: 'Unusual transaction amount', category: 'FINANCIAL ANOMALY', description: '\u20b98,50,000 transfer is ~40x this cluster\'s average transaction size.', timestamp: '2026-08-12 14:02', severity: 'High' },
  { id: 'a2', title: 'New bridge connection detected', category: 'NETWORK ANOMALY', description: 'Mohit Sharma now connects Community 1 and Community 2 for the first time.', timestamp: '2026-08-07 09:41', severity: 'High' },
  { id: 'a3', title: 'Unusual communication pattern', category: 'COMMUNICATION ANOMALY', description: 'Rahul Verma\'s contact count rose from 2 to 9 numbers in 48 hours.', timestamp: '2026-08-04 21:10', severity: 'Medium' },
  { id: 'a4', title: 'Rapid network expansion', category: 'NETWORK ANOMALY', description: 'Community 2 grew by 3 new entities this week.', timestamp: '2026-08-10 08:15', severity: 'Medium' },
  { id: 'a5', title: 'Repeated contact pattern', category: 'COMMUNICATION ANOMALY', description: 'Deepak Rana and Karan Malik in contact 6 times over 3 days.', timestamp: '2026-08-10 17:30', severity: 'Low' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'FINANCIAL ANOMALY': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'NETWORK ANOMALY': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'COMMUNICATION ANOMALY': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
};

const SEVERITY_COLORS: Record<string, string> = {
  High: 'border-l-red-500',
  Medium: 'border-l-amber-500',
  Low: 'border-l-emerald-500',
};

export default function Alerts() {
  const { caseData, loading } = useCaseData();
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [detecting, setDetecting] = useState(false);

  const filtered = filter === 'All' ? DEMO_ALERTS : DEMO_ALERTS.filter(a => a.severity === filter);

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
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Alerts</h1>
          <p className="text-xs text-gray-500">Anomaly and pattern detection output for {caseData.title}.</p>
        </div>
        <button onClick={() => { setDetecting(true); setTimeout(() => setDetecting(false), 2000); }} className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
          {detecting ? 'Detecting...' : 'RUN ANOMALY DETECTION'}
        </button>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['All', 'High', 'Medium', 'Low'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 border ${
              filter === s ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20' : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'
            }`}>{s}</button>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <div key={alert.id} className={`glass-card p-5 border-l-2 ${SEVERITY_COLORS[alert.severity]} stagger-item`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold">{alert.title}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[alert.category] || 'bg-gray-500/10 text-gray-400'}`}>{alert.category}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{alert.description}</p>
              <p className="text-[10px] text-gray-500 font-mono">{alert.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
