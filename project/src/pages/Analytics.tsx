import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';

export default function Analytics() {
  const { caseId } = useParams();
  const { isDemo } = useAuth();
  const risk = demoStore.getRiskAssessment();
  const analysis = demoStore.getAnalysis();
  const fir = demoStore.getFIR();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

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
        <header className="border-b border-[#2a3a4a] px-6 py-4 sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10">
          <h1 className="text-lg font-bold">Analytics</h1>
          <p className="text-xs text-gray-400">Risk assessment and investigation analysis — from FIR data</p>
        </header>

        <div className="p-6 space-y-6">
          {/* Disclaimer Banner */}
          {showDisclaimer && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-400 text-[20px] mt-0.5">warning</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-400">Important Disclaimer</p>
                <p className="text-xs text-gray-400 mt-1">
                  NETRA is an investigative decision-support prototype. Risk scores are deterministic/rule-based, NOT AI predictions.
                  They are for investigative prioritization only and should not be used as the sole basis for any decision.
                </p>
              </div>
              <button onClick={() => setShowDisclaimer(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Risk Score Card */}
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">speed</span>
              <span className="font-medium">Risk Assessment</span>
              <span className="text-[10px] text-gray-500 ml-auto">Deterministic rule-based scoring</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-8">
                {/* Score Gauge */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#2a3a4a" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={risk?.risk_level === 'HIGH' ? '#ef4444' : risk?.risk_level === 'MEDIUM' ? '#eab308' : '#22c55e'}
                      strokeWidth="8"
                      strokeDasharray={`${(risk?.risk_score || 0) * 3.27} 327`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{risk?.risk_score || 0}</span>
                    <span className="text-[10px] text-gray-400">/ 100</span>
                    <span className={`text-sm font-semibold mt-1 ${risk?.risk_level === 'HIGH' ? 'text-red-400' : risk?.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {risk?.risk_level || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Risk Factors</h3>
                  {risk?.factors.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{f.label}</span>
                        <span className="text-gray-400">+{f.impact}</span>
                      </div>
                      <div className="h-1.5 bg-[#2a3a4a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (f.impact / 30) * 100)}%`,
                            background: f.impact >= 15 ? '#ef4444' : f.impact >= 8 ? '#eab308' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Summary */}
          {analysis && (
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">summarize</span>
                <span className="font-medium">Investigation Summary</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>
          )}

          {/* Investigative Leads */}
          {analysis && (
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">lightbulb</span>
                <span className="font-medium">Investigative Leads</span>
                <span className="text-xs text-gray-400 ml-auto">{analysis.investigative_leads.length} leads</span>
              </div>
              <div className="divide-y divide-[#2a3a4a]/50">
                {analysis.investigative_leads.map((lead, i) => (
                  <div key={i} className="px-6 py-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-[16px] mt-0.5">arrow_right</span>
                    <span className="text-sm text-gray-300">{lead}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Attributes */}
          {analysis && (
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">key</span>
                <span className="font-medium">Important Attributes</span>
                <span className="text-xs text-gray-400 ml-auto">{analysis.important_attributes.length} attributes</span>
              </div>
              <div className="divide-y divide-[#2a3a4a]/50">
                {analysis.important_attributes.map((attr, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-400">{attr.field}</span>
                    <span className="text-sm font-mono text-gray-200">{String(attr.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIR Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Victim Count', value: fir.victim_count, icon: 'person' },
              { label: 'Accused Count', value: fir.accused_count, icon: 'group' },
              { label: 'Arrested Count', value: fir.arrested_count, icon: 'verified_user' },
              { label: 'Chargesheeted', value: fir.accused_chargesheeted, icon: 'gavel' },
              { label: 'Convictions', value: fir.conviction_count, icon: 'balance' },
              { label: 'Arrest Rate', value: fir.accused_count > 0 ? `${Math.round((fir.arrested_count / fir.accused_count) * 100)}%` : 'N/A', icon: 'percent' },
            ].map(s => (
              <div key={s.label} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4cd7f6]">{s.icon}</span>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
