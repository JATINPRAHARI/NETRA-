import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';

export default function Report() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const caseData = demoStore.getCase();
  const fir = demoStore.getFIR();
  const entities = demoStore.getEntities();
  const relationships = demoStore.getRelationships();
  const risk = demoStore.getRiskAssessment();
  const analysis = demoStore.getAnalysis();
  const evidence = demoStore.getEvidence();
  const [generated, setGenerated] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateReport = () => {
    setGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0d141d] text-white flex">
      <aside className="w-64 border-r border-[#2a3a4a] flex flex-col fixed h-full">
        <div className="p-4 border-b border-[#2a3a4a] flex items-center gap-2">
          <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7"><circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/><ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="4" fill="#4cd7f6"/><circle cx="24" cy="24" r="1.5" fill="#0d141d"/></svg>
          <span className="font-bold">Netra</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">dashboard</span>Dashboard</Link>
          <div className="pt-2 pb-1 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Case</div>
          {[{ p: '', i: 'folder', l: 'Overview' }, { p: '/fir', i: 'description', l: 'FIR Details' }, { p: '/entities', i: 'hub', l: 'Entities' }, { p: '/graph', i: 'lan', l: 'Knowledge Graph' }, { p: '/analytics', i: 'analytics', l: 'Analytics' }, { p: '/evidence', i: 'folder_shared', l: 'Evidence' }, { p: '/audit', i: 'history', l: 'Audit Trail' }, { p: '/report', i: 'summarize', l: 'Report' }].map(n => (
            <Link key={n.p} to={`/cases/${caseId}${n.p}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">{n.i}</span>{n.l}</Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64">
        <header className="border-b border-[#2a3a4a] px-6 py-4 sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Report</h1>
            <p className="text-xs text-gray-400">Generate case intelligence report</p>
          </div>
          <div className="flex items-center gap-2">
            {generated && (
              <button onClick={handlePrint} className="px-3 py-1.5 bg-[#2a3a4a] hover:bg-[#3a4a5a] rounded-lg text-xs transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">print</span>
                Print / PDF
              </button>
            )}
          </div>
        </header>

        <div className="p-6 space-y-6">
          {!generated ? (
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-[#4cd7f6] mb-3 block">summarize</span>
              <h2 className="text-lg font-bold mb-2">Generate Case Report</h2>
              <p className="text-sm text-gray-400 mb-1">
                This will compile all case data, FIR details, entities, relationships, risk assessment,
                analysis, evidence, and audit trail into a comprehensive report.
              </p>
              <p className="text-[10px] text-gray-500 mb-6">
                Report will include disclaimer: NETRA is an investigative decision-support prototype.
              </p>
              <button
                onClick={generateReport}
                className="px-6 py-3 bg-[#4cd7f6] hover:bg-[#3bc4e3] text-[#0d141d] font-semibold rounded-lg transition-colors"
              >
                Generate Report
              </button>
            </div>
          ) : (
            <div ref={reportRef} className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl">
              {/* Report Header */}
              <div className="bg-[#0d141d] text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10"><circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/><ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="4" fill="#4cd7f6"/><circle cx="24" cy="24" r="1.5" fill="#0d141d"/></svg>
                    <div>
                      <h1 className="text-xl font-bold">Netra — Case Intelligence Report</h1>
                      <p className="text-xs text-gray-400">Prototype — Karnataka FIR Dataset — 1 Record</p>
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
                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 text-xs mb-1">Disclaimer</p>
                  <p className="text-xs text-yellow-700">
                    NETRA is an investigative decision-support prototype. Risk scores are deterministic/rule-based, NOT AI predictions.
                    They are for investigative prioritization only and should not be used as the sole basis for any decision.
                    All data is derived from one FIR record from the Karnataka Police FIR Dataset.
                  </p>
                </div>

                {/* Case Information */}
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

                {/* FIR Details */}
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">2. FIR Details</h2>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="py-1 text-gray-500 w-1/3">FIR Number</td><td className="py-1 font-mono">{fir.fir_number}</td></tr>
                      <tr><td className="py-1 text-gray-500">FIR Type</td><td className="py-1">{fir.fir_type || 'Not Available'}</td></tr>
                      <tr><td className="py-1 text-gray-500">Crime Group</td><td className="py-1">{fir.crime_group_name}</td></tr>
                      <tr><td className="py-1 text-gray-500">Crime Head</td><td className="py-1">{fir.crime_head_name}</td></tr>
                      <tr><td className="py-1 text-gray-500">Act/Section</td><td className="py-1">{fir.act_section}</td></tr>
                      <tr><td className="py-1 text-gray-500">District</td><td className="py-1">{fir.district_name}</td></tr>
                      <tr><td className="py-1 text-gray-500">Place of Offence</td><td className="py-1">{fir.place_of_offence}</td></tr>
                      <tr><td className="py-1 text-gray-500">Date</td><td className="py-1">{fir.fir_day}/{fir.fir_month}/{fir.fir_year}</td></tr>
                      <tr><td className="py-1 text-gray-500">IO</td><td className="py-1">{fir.io_name}</td></tr>
                      <tr><td className="py-1 text-gray-500">Unit</td><td className="py-1">{fir.unit_name}</td></tr>
                      <tr><td className="py-1 text-gray-500">Victims</td><td className="py-1">{fir.victim_count}</td></tr>
                      <tr><td className="py-1 text-gray-500">Accused</td><td className="py-1">{fir.accused_count}</td></tr>
                      <tr><td className="py-1 text-gray-500">Arrested</td><td className="py-1">{fir.arrested_count}</td></tr>
                      <tr><td className="py-1 text-gray-500">Coordinates</td><td className="py-1">{fir.latitude && fir.longitude ? `${fir.latitude}, ${fir.longitude}` : 'Not Available'}</td></tr>
                    </tbody>
                  </table>
                </section>

                {/* Risk Assessment */}
                {risk && (
                  <section>
                    <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">3. Risk Assessment</h2>
                    <div className="flex items-center gap-6 mb-3">
                      <div className="text-3xl font-bold">{risk.risk_score}/100</div>
                      <div>
                        <div className={`text-lg font-bold ${risk.risk_level === 'HIGH' ? 'text-red-600' : risk.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {risk.risk_level}
                        </div>
                        <div className="text-[10px] text-gray-500">Deterministic rule-based scoring</div>
                      </div>
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Factor</th><th className="text-right py-1 text-gray-500">Weight</th></tr></thead>
                      <tbody>
                        {risk.factors.map((f, i) => (
                          <tr key={i}><td className="py-1">{f.label}</td><td className="py-1 text-right font-mono">+{f.impact}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {/* Entities */}
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">4. Extracted Entities</h2>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Type</th><th className="text-left py-1 text-gray-500">Name</th><th className="text-left py-1 text-gray-500">ID</th></tr></thead>
                    <tbody>
                      {entities.map(e => (
                        <tr key={e.id}><td className="py-1 font-mono">{e.type}</td><td className="py-1">{e.name}</td><td className="py-1 font-mono text-gray-400">{e.id}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {/* Relationships */}
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">5. Relationships</h2>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Source</th><th className="text-left py-1 text-gray-500">Type</th><th className="text-left py-1 text-gray-500">Target</th></tr></thead>
                    <tbody>
                      {relationships.map(r => {
                        const src = entities.find(e => e.id === r.source_id);
                        const tgt = entities.find(e => e.id === r.target_id);
                        return (
                          <tr key={r.id}><td className="py-1">{src?.name}</td><td className="py-1 font-mono">{r.type}</td><td className="py-1">{tgt?.name}</td></tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>

                {/* Investigation Summary */}
                {analysis && (
                  <section>
                    <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">6. Investigation Summary</h2>
                    <p className="text-xs leading-relaxed mb-3">{analysis.summary}</p>
                    <h3 className="font-semibold text-xs mb-1">Investigative Leads:</h3>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {analysis.investigative_leads.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </section>
                )}

                {/* Evidence */}
                {evidence.length > 0 && (
                  <section>
                    <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">7. Evidence</h2>
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500">Filename</th><th className="text-left py-1 text-gray-500">SHA-256</th><th className="text-left py-1 text-gray-500">Size</th></tr></thead>
                      <tbody>
                        {evidence.map(ev => (
                          <tr key={ev.id}><td className="py-1">{ev.file_name}</td><td className="py-1 font-mono text-[10px] text-gray-400 max-w-[200px] truncate">{ev.sha256_hash}</td><td className="py-1">{(ev.file_size / 1024).toFixed(1)} KB</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {/* Audit Summary */}
                <section>
                  <h2 className="text-base font-bold border-b border-gray-200 pb-1 mb-3">8. Audit Trail Summary</h2>
                  <p className="text-xs text-gray-600">
                    {demoStore.getAuditLogs().length} events recorded. All actions are append-only with SHA-256 integrity hashes.
                  </p>
                </section>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <p className="text-[10px] text-gray-400 text-center">
                    NETRA — Prototype | Karnataka FIR Dataset — 1 Record | Generated {new Date().toLocaleString()} | {user?.name}
                  </p>
                  <p className="text-[10px] text-gray-400 text-center mt-1">
                    This report is generated by an investigative decision-support prototype and should not be used as the sole basis for any decision.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
