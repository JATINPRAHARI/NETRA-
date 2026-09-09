import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useCaseData } from '@/lib/useCaseData';
import { generateReport as generateReportDb } from '@/lib/data';
import Layout from '@/components/Layout';

export default function Report() {
  const { user } = useAuth();
  const { caseData, fir, entities, relationships, risk, analysis, evidence, auditLogs, loading } = useCaseData();
  const [generated, setGenerated] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState('');

  const generateReport = async () => {
    setGenerating(true);
    setReportError('');
    try {
      await generateReportDb(caseData.id);
      setGenerated(true);
    } catch (err) {
      console.error('Report generation failed:', err);
      setReportError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading report...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between no-print" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Report</h1>
          <p className="text-xs text-gray-500">Generate case intelligence report</p>
        </div>
        {generated && (
          <button onClick={handlePrint} className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 flex items-center gap-1.5 font-medium no-print">
            <span className="material-symbols-outlined text-[14px]">print</span>
            Print / PDF
          </button>
        )}
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {!generated ? (
          <div className="glass-card p-12 text-center no-print">
            <div className="w-20 h-20 rounded-3xl bg-[#4cd7f6]/10 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-4xl text-[#4cd7f6]">summarize</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Generate Case Report</h2>
            <p className="text-sm text-gray-400 mb-1 max-w-md mx-auto">
              This will compile all case data, FIR details, entities, relationships, risk assessment,
              analysis, evidence, and audit trail into a comprehensive report.
            </p>
            <p className="text-[10px] text-gray-500 mb-8">
              Report will include disclaimer: NETRA is an investigative decision-support prototype.
            </p>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-8 py-3 bg-gradient-to-r from-[#4cd7f6] to-[#3bc4e3] hover:from-[#3bc4e3] hover:to-[#4cd7f6] text-[#0a0f18] font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#4cd7f6]/10 hover:shadow-[#4cd7f6]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0a0f18]/30 border-t-[#0a0f18] rounded-full animate-spin"></div>
                  Generating...
                </span>
              ) : 'Generate Report'}
            </button>
            {reportError && (
              <p className="text-xs text-red-400 mt-3">{reportError}</p>
            )}
          </div>
        ) : (
          <div ref={reportRef} className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#0a0f18] text-white px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10"><circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0a0f18"/><ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="4" fill="#4cd7f6"/><circle cx="24" cy="24" r="1.5" fill="#0a0f18"/></svg>
                  <div>
                    <h1 className="text-xl font-bold">Netra — Case Intelligence Report</h1>
                    <p className="text-xs text-gray-400">NETRA — Criminal Intelligence Platform</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Generated: {new Date().toLocaleString()}</p>
                  <p>Generated by: {user?.name}</p>
                  <p className="font-mono mt-1">{caseData.id}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6 text-sm">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="font-semibold text-yellow-800 text-xs mb-1">Disclaimer</p>
                <p className="text-xs text-yellow-700">
                  NETRA is an investigative decision-support prototype. Risk scores are deterministic/rule-based, NOT AI predictions.
                  They are for investigative prioritization only and should not be used as the sole basis for any decision.
                </p>
              </div>

              <section>
                <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">1. Case Information</h2>
                <table className="w-full text-xs">
                  <tbody>
                    <tr><td className="py-1 text-gray-500 w-1/3">Case ID</td><td className="py-1 font-mono">{caseData.id}</td></tr>
                    <tr><td className="py-1 text-gray-500">Title</td><td className="py-1">{caseData.title}</td></tr>
                    <tr><td className="py-1 text-gray-500">Status</td><td className="py-1">{caseData.status}</td></tr>
                    <tr><td className="py-1 text-gray-500">Priority</td><td className="py-1">{caseData.priority}</td></tr>
                    <tr><td className="py-1 text-gray-500">Source</td><td className="py-1">{caseData.source}</td></tr>
                    <tr><td className="py-1 text-gray-500">Description</td><td className="py-1">{caseData.description}</td></tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">2. FIR Details</h2>
                <table className="w-full text-xs">
                  <tbody>
                    <tr><td className="py-1 text-gray-500 w-1/3">FIR Number</td><td className="py-1 font-mono">{fir.fir_number}</td></tr>
                    <tr><td className="py-1 text-gray-500">FIR Type</td><td className="py-1">{fir.fir_type || 'N/A'}</td></tr>
                    <tr><td className="py-1 text-gray-500">Crime Group</td><td className="py-1">{fir.crime_group_name}</td></tr>
                    <tr><td className="py-1 text-gray-500">Crime Head</td><td className="py-1">{fir.crime_head_name}</td></tr>
                    <tr><td className="py-1 text-gray-500">Act/Section</td><td className="py-1">{fir.act_section}</td></tr>
                    <tr><td className="py-1 text-gray-500">District</td><td className="py-1">{fir.district_name}</td></tr>
                    <tr><td className="py-1 text-gray-500">Date</td><td className="py-1">{fir.fir_day}/{fir.fir_month}/{fir.fir_year}</td></tr>
                    <tr><td className="py-1 text-gray-500">IO</td><td className="py-1">{fir.io_name}</td></tr>
                    <tr><td className="py-1 text-gray-500">Victims</td><td className="py-1">{fir.victim_count}</td></tr>
                    <tr><td className="py-1 text-gray-500">Accused</td><td className="py-1">{fir.accused_count}</td></tr>
                    <tr><td className="py-1 text-gray-500">Arrested</td><td className="py-1">{fir.arrested_count}</td></tr>
                  </tbody>
                </table>
              </section>

              {risk && (
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">3. Risk Assessment</h2>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-3xl font-bold">{risk.risk_score}/100</div>
                    <div className={`text-lg font-bold ${risk.risk_level === 'CRITICAL' ? 'text-red-700' : risk.risk_level === 'HIGH' ? 'text-red-600' : risk.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{risk.risk_level}</div>
                  </div>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Factor</th><th className="text-right py-1 text-gray-500">Weight</th></tr></thead>
                    <tbody>
                      {risk.factors?.map((f: { label: string; impact: number }, i: number) => (
                        <tr key={i}><td className="py-1">{f.label}</td><td className="py-1 text-right font-mono">+{f.impact}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              <section>
                <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">4. Extracted Entities</h2>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Type</th><th className="text-left py-1 text-gray-500">Name</th></tr></thead>
                  <tbody>
                    {entities.map(e => <tr key={e.id}><td className="py-1 font-mono">{e.type}</td><td className="py-1">{e.name}</td></tr>)}
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">5. Relationships</h2>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Source</th><th className="text-left py-1 text-gray-500">Type</th><th className="text-left py-1 text-gray-500">Target</th></tr></thead>
                  <tbody>
                    {relationships.map(r => {
                      const src = entities.find(e => e.id === r.source_id);
                      const tgt = entities.find(e => e.id === r.target_id);
                      return <tr key={r.id}><td className="py-1">{src?.name}</td><td className="py-1 font-mono">{r.type}</td><td className="py-1">{tgt?.name}</td></tr>;
                    })}
                  </tbody>
                </table>
              </section>

              {analysis && (
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">6. Investigation Summary</h2>
                  <p className="text-xs leading-relaxed mb-3">{analysis.summary}</p>
                  <h3 className="font-semibold text-xs mb-1">Investigative Leads:</h3>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {analysis.investigative_leads?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                  </ul>
                </section>
              )}

              {evidence.length > 0 && (
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">7. Evidence</h2>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">File</th><th className="text-left py-1 text-gray-500">SHA-256</th><th className="text-left py-1 text-gray-500">Size</th></tr></thead>
                    <tbody>
                      {evidence.map(ev => <tr key={ev.id}><td className="py-1">{ev.file_name}</td><td className="py-1 font-mono text-[10px] max-w-[180px] truncate">{ev.sha256_hash}</td><td className="py-1">{(ev.file_size / 1024).toFixed(1)} KB</td></tr>)}
                    </tbody>
                  </table>
                </section>
              )}

              <section>
                <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">8. Audit Trail</h2>
                <p className="text-xs text-gray-600">{auditLogs.length} events recorded. All actions are append-only with SHA-256 integrity hashes.</p>
              </section>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <p className="text-[10px] text-gray-400 text-center">
                  NETRA — Criminal Intelligence Platform | Generated {new Date().toLocaleString()} | {user?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </Layout>
  );
}
