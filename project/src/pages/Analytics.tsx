import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const RISK_LEVELS = {
  LOW: { color: '#22c55e', label: 'LOW', bg: 'bg-emerald-500/10 text-emerald-400' },
  MEDIUM: { color: '#eab308', label: 'MEDIUM', bg: 'bg-amber-500/10 text-amber-400' },
  HIGH: { color: '#ef4444', label: 'HIGH', bg: 'bg-red-500/10 text-red-400' },
  CRITICAL: { color: '#dc2626', label: 'CRITICAL', bg: 'bg-red-600/10 text-red-500' },
};

function SeverityGauge({ score, level }: { score: number; level: string }) {
  const r = RISK_LEVELS[level as keyof typeof RISK_LEVELS] || RISK_LEVELS.LOW;
  return (
    <div className="relative w-52 h-52 flex-shrink-0">
      <svg viewBox="0 0 140 140" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="33%" stopColor="#eab308" />
            <stop offset="66%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <circle cx="70" cy="70" r="58" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${score * 3.64} 364`} transform="rotate(-90 70 70)" style={{ filter: `drop-shadow(0 0 8px ${r.color}40)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color: r.color }}>{score}</span>
        <span className="text-[11px] text-gray-500 mt-0.5">/ 100</span>
        <span className={`text-sm font-semibold mt-2 px-3 py-1 rounded-full ${r.bg}`}>{r.label}</span>
      </div>
    </div>
  );
}

function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-gray-400">{value}</span>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}30` }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const { caseData, fir, risk, analysis, entities, relationships, loading } = useCaseData();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const arrestRate = fir.accused_count > 0 ? Math.round((fir.arrested_count / fir.accused_count) * 100) : 0;
  const totalVictims = fir.victim_count;
  const maleRatio = totalVictims > 0 ? Math.round((fir.male_victims / totalVictims) * 100) : 0;
  const maxImpact = Math.max(...(risk?.factors?.map((f: { impact: number }) => f.impact) || [0]));

  const entityTypes = entities.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topEntityType = Object.entries(entityTypes).sort((a, b) => b[1] - a[1])[0];

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
        <p className="text-xs text-gray-500">Risk assessment, investigation analysis, and case intelligence — from FIR data</p>
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

        {/* Risk Score + Key Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Gauge */}
          <div className="glass-card overflow-hidden flex flex-col items-center py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">speed</span>
              <span className="font-medium text-sm">Risk Score</span>
            </div>
            <SeverityGauge score={risk?.risk_score || 0} level={risk?.risk_level || 'LOW'} />
            <p className="text-[10px] text-gray-500 mt-3 px-4 text-center">Deterministic rule-based scoring — {risk?.factors?.length || 0} factors evaluated</p>
          </div>

          {/* Key Metrics */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">analytics</span>
              <span className="font-medium text-sm">Key Metrics</span>
            </div>
            <div className="space-y-4">
              <HorizontalBar label="Arrest Rate" value={arrestRate} max={100} color={arrestRate >= 50 ? '#22c55e' : arrestRate >= 25 ? '#eab308' : '#ef4444'} />
              <HorizontalBar label="Victims" value={totalVictims} max={10} color="#4cd7f6" />
              <HorizontalBar label="Accused" value={fir.accused_count} max={10} color="#f97316" />
              <HorizontalBar label="Chargesheeted" value={fir.accused_chargesheeted} max={fir.accused_count || 1} color="#a855f7" />
              <HorizontalBar label="Convictions" value={fir.conviction_count} max={fir.accused_count || 1} color="#ef4444" />
            </div>
          </div>

          {/* Case Overview Stats */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">info</span>
              <span className="font-medium text-sm">Case Overview</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Case ID', value: caseData.id, mono: true },
                { label: 'Status', value: caseData.status, color: '#22c55e' },
                { label: 'Priority', value: caseData.priority, color: caseData.priority === 'High' ? '#ef4444' : caseData.priority === 'Critical' ? '#dc2626' : '#eab308' },
                { label: 'Crime Type', value: fir.crime_group_name || 'N/A' },
                { label: 'Crime Head', value: fir.crime_head_name || 'N/A' },
                { label: 'District', value: fir.district_name || 'N/A' },
                { label: 'IO', value: fir.io_name || 'N/A' },
                { label: 'Entities', value: String(entities.length) },
                { label: 'Relationships', value: String(relationships.length) },
                { label: 'Network Nodes', value: topEntityType ? `${topEntityType[0]} (${topEntityType[1]})` : 'N/A' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.03] last:border-0">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-medium text-right ${item.mono ? 'font-mono text-[10px]' : ''}`} style={{ color: item.color || 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {risk?.factors && (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">gauge</span>
              <span className="font-medium text-sm">Risk Factor Breakdown</span>
              <span className="text-xs text-gray-500 ml-auto">{risk.factors.length} factors — max impact: +{maxImpact}</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risk.factors.map((f: { label: string; value: string; impact: number }, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-300">{f.label}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{
                        background: f.impact >= 15 ? '#ef444420' : f.impact >= 8 ? '#eab30820' : '#22c55e20',
                        color: f.impact >= 15 ? '#ef4444' : f.impact >= 8 ? '#eab308' : '#22c55e',
                      }}>+{f.impact}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">{f.value}</p>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${maxImpact > 0 ? (f.impact / maxImpact) * 100 : 0}%`,
                          background: f.impact >= 15 ? '#ef4444' : f.impact >= 8 ? '#eab308' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investigation Summary + Leads */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">summarize</span>
                <span className="font-medium text-sm">Investigation Summary</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Important Attributes */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">key</span>
                <span className="font-medium text-sm">Important Attributes</span>
                <span className="text-xs text-gray-500 ml-auto">{analysis.important_attributes.length}</span>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {analysis.important_attributes.map((attr: { field: string; value: string; reason: string }, i: number) => (
                  <div key={i} className="px-6 py-3 hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-300">{attr.field}</span>
                      <span className="text-xs font-mono text-[var(--accent)]">{String(attr.value)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{attr.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investigative Leads */}
        {analysis?.investigative_leads && (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--accent)] text-[18px]">lightbulb</span>
              <span className="font-medium text-sm">Investigative Leads</span>
              <span className="text-xs text-gray-500 ml-auto">{analysis.investigative_leads.length} leads identified</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {analysis.investigative_leads.map((lead: string, i: number) => (
                <div key={i} className="px-6 py-3 flex items-start gap-3 hover:bg-white/[0.01] transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] text-[var(--accent)] font-mono font-bold">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">{lead}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIR Detail Stats Grid */}
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-[var(--accent)]">description</span>
            FIR Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Male Victims', value: fir.male_victims, icon: 'man', color: '#3b82f6' },
              { label: 'Female Victims', value: fir.female_victims, icon: 'woman', color: '#ec4899' },
              { label: 'Arrested Male', value: fir.arrested_male, icon: 'gavel', color: '#22c55e' },
              { label: 'Arrested Female', value: fir.arrested_female, icon: 'gavel', color: '#22c55e' },
              { label: 'Arrest Rate', value: `${arrestRate}%`, icon: 'percent', color: '#eab308' },
            ].map((s, i) => (
              <div key={s.label} className="stat-card stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
