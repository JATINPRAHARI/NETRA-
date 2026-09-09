import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type ReportSection = 'Case overview' | 'Network graph' | 'Key individuals' | 'Timeline' | 'Anomalies' | 'Evidence log';

const DEMO_REPORT = {
  id: 'RPT-118',
  caseId: 'CASE-1024',
  title: 'Operation Netra — Interim Network Report',
  generated: '2026-08-13 09:00',
  sections: ['Case overview', 'Network graph', 'Key individuals', 'Timeline', 'Anomalies', 'Evidence log'] as ReportSection[],
};

export default function InvestigationReports() {
  const { caseData, loading } = useCaseData();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const handleExport = (format: string) => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
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
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Investigation Reports</h1>
          <p className="text-xs text-gray-500">Exports combine case overview, graph, timeline, evidence log, and AI summary. Demo mode: export buttons are disabled — connect the backend.</p>
        </div>
        <button className="px-4 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] font-medium text-xs rounded-xl transition-all duration-200 border border-[var(--accent)]/20">
          GENERATE REPORT
        </button>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Report Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold">{DEMO_REPORT.title}</h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1">{DEMO_REPORT.id} · {DEMO_REPORT.caseId} · generated {DEMO_REPORT.generated}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {DEMO_REPORT.sections.map(s => (
              <span key={s} className="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.03] text-gray-400">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('pdf')} disabled={generating} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40">EXPORT PDF</button>
            <button onClick={() => handleExport('csv')} disabled={generating} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40">EXPORT CSV</button>
            <button onClick={() => handleExport('json')} disabled={generating} className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40">EXPORT JSON</button>
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
