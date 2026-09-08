import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

export default function Analytics() {
  const { caseData, fir, risk, analysis, loading } = useCaseData();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="text-xs text-gray-500">Risk assessment and investigation analysis — from FIR data</p>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Disclaimer */}
        {showDisclaimer && (
          <div className="glass-card p-4 border-l-2 border-l-amber-500 flex items-start gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-amber-400 text-[20px] mt-0.5">warning</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Important Disclaimer</p>
              <p className="text-xs text-gray-400 mt-1">
                NETRA is an investigative decision-support prototype. Risk scores are deterministic/rule-based, NOT AI predictions.
                They are for investigative prioritization only and should not be used as the sole basis for any decision.
              </p>
            </div>
            <button onClick={() => setShowDisclaimer(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[16px] text-gray-400">close</span>
            </button>
          </div>
        )}

        {/* Risk Score Card */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">speed</span>
            <span className="font-medium text-sm">Risk Assessment</span>
            <span className="text-[10px] text-gray-500 ml-auto">Deterministic rule-based scoring</span>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Score Gauge */}
              <div className="relative w-44 h-44 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={risk?.risk_level === 'HIGH' ? '#ef4444' : risk?.risk_level === 'MEDIUM' ? '#eab308' : '#22c55e'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(risk?.risk_score || 0) * 3.27} 327`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{risk?.risk_score || 0}</span>
                  <span className="text-[10px] text-gray-500">/ 100</span>
                  <span className={`text-sm font-semibold mt-1 ${risk?.risk_level === 'HIGH' ? 'text-red-400' : risk?.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {risk?.risk_level || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Factors */}
              <div className="flex-1 space-y-3 w-full">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Factors</h3>
                {risk?.factors?.map((f: { label: string; value: string; impact: number }, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{f.label}</span>
                      <span className="text-gray-500 font-mono">+{f.impact}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
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
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">summarize</span>
              <span className="font-medium text-sm">Investigation Summary</span>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
        )}

        {/* Investigative Leads */}
        {analysis && (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">lightbulb</span>
              <span className="font-medium text-sm">Investigative Leads</span>
              <span className="text-xs text-gray-500 ml-auto">{analysis.investigative_leads.length} leads</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {analysis.investigative_leads.map((lead: string, i: number) => (
                <div key={i} className="px-6 py-3 flex items-start gap-3 hover:bg-white/[0.01] transition-colors">
                  <div className="w-5 h-5 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] text-[#4cd7f6] font-mono">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-300">{lead}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Attributes */}
        {analysis && (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">key</span>
              <span className="font-medium text-sm">Important Attributes</span>
              <span className="text-xs text-gray-500 ml-auto">{analysis.important_attributes.length} attributes</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {analysis.important_attributes.map((attr: { field: string; value: string; reason: string }, i: number) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div>
                    <span className="text-sm text-gray-300">{attr.field}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{attr.reason}</p>
                  </div>
                  <span className="text-sm font-mono text-white">{String(attr.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIR Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Victim Count', value: fir.victim_count, icon: 'person', color: 'text-[#4cd7f6]' },
            { label: 'Accused Count', value: fir.accused_count, icon: 'group', color: 'text-amber-400' },
            { label: 'Arrested Count', value: fir.arrested_count, icon: 'verified_user', color: 'text-emerald-400' },
            { label: 'Chargesheeted', value: fir.accused_chargesheeted, icon: 'gavel', color: 'text-purple-400' },
            { label: 'Convictions', value: fir.conviction_count, icon: 'balance', color: 'text-red-400' },
            { label: 'Arrest Rate', value: fir.accused_count > 0 ? `${Math.round((fir.arrested_count / fir.accused_count) * 100)}%` : 'N/A', icon: 'percent', color: 'text-[#4cd7f6]' },
          ].map((s, i) => (
            <div key={s.label} className="stat-card stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                </div>
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
