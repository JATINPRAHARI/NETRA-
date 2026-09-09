import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

export default function CaseOverview() {
  const { isDemo } = useAuth();
  const { caseData, fir, entities, risk, loading } = useCaseData();

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading case data...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{caseData.title}</h1>
            <p className="text-sm text-gray-400 font-mono">{caseData.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 px-3 py-1 rounded-lg uppercase tracking-wider font-medium">
              {isDemo ? 'Prototype' : caseData.source}
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-medium">{caseData.status}</span>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="glass-card p-5 border-l-2 border-l-[#4cd7f6]">
          <p className="text-sm text-[#4cd7f6] font-medium">NETRA — Prototype | Karnataka FIR Dataset — 1 Record</p>
          <p className="text-xs text-gray-400 mt-1">This case contains one FIR from the Karnataka Police FIR Dataset. All entities, relationships, and analytics are derived from this single record.</p>
        </div>

        {/* 3 Column Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Case Information</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Case ID</span><span className="font-mono text-xs">{caseData.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Title</span><span className="text-xs">{caseData.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Status</span><span className="text-xs text-emerald-400">{caseData.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Priority</span><span className="text-xs text-amber-400">{caseData.priority}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Source</span><span className="text-xs text-right max-w-[160px] truncate">{caseData.source}</span></div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>FIR Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 text-xs">FIR Number</span><span className="font-mono text-xs">{fir.fir_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Crime</span><span className="text-xs">{fir.crime_group_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">District</span><span className="text-xs">{fir.district_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">Date</span><span className="text-xs">{fir.fir_day}/{fir.fir_month}/{fir.fir_year}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-xs">IO</span><span className="text-xs">{fir.io_name}</span></div>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Risk Assessment</h3>
            <div className="flex items-center gap-5 mb-3">
              <div className="relative">
                <svg viewBox="0 0 80 80" className="w-20 h-20">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={risk?.risk_level === 'CRITICAL' ? '#dc2626' : risk?.risk_level === 'HIGH' ? '#ef4444' : risk?.risk_level === 'MEDIUM' ? '#eab308' : '#22c55e'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(risk?.risk_score || 0) * 2.14} 214`}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{risk?.risk_score || 0}</span>
                  <span className="text-[8px] text-gray-500">/100</span>
                </div>
              </div>
              <div>
                <div className={`text-lg font-bold ${risk?.risk_level === 'CRITICAL' ? 'text-red-500' : risk?.risk_level === 'HIGH' ? 'text-red-400' : risk?.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {risk?.risk_level || 'N/A'}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Investigative<br/>prioritization only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Victims', value: fir.victim_count, icon: 'person', color: 'text-[#4cd7f6]' },
            { label: 'Accused', value: fir.accused_count, icon: 'group', color: 'text-amber-400' },
            { label: 'Arrested', value: fir.arrested_count, icon: 'verified_user', color: 'text-emerald-400' },
            { label: 'Entities', value: entities.length, icon: 'hub', color: 'text-purple-400' },
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

        {/* Description */}
        <div className="glass-card p-5">
          <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Description</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{caseData.description}</p>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: `/cases/${caseData.id}/fir`, icon: 'description', label: 'View FIR' },
            { to: `/cases/${caseData.id}/graph`, icon: 'hub', label: 'Knowledge Graph' },
            { to: `/cases/${caseData.id}/analytics`, icon: 'analytics', label: 'Analytics' },
            { to: `/cases/${caseData.id}/report`, icon: 'summarize', label: 'Generate Report' },
          ].map((a, i) => (
            <Link key={a.to} to={a.to} className="glass-card-hover p-4 group stagger-item flex items-center gap-3" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
              <span className="material-symbols-outlined text-[#4cd7f6] group-hover:scale-110 transition-transform">{a.icon}</span>
              <span className="text-sm">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
