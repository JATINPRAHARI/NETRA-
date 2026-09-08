import { useParams, Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';

const NAV = [
  { path: '', icon: 'folder', label: 'Overview' },
  { path: '/fir', icon: 'description', label: 'FIR Details' },
  { path: '/entities', icon: 'hub', label: 'Entities' },
  { path: '/graph', icon: 'lan', label: 'Knowledge Graph' },
  { path: '/analytics', icon: 'analytics', label: 'Analytics' },
  { path: '/evidence', icon: 'folder_shared', label: 'Evidence' },
  { path: '/audit', icon: 'history', label: 'Audit Trail' },
  { path: '/report', icon: 'summarize', label: 'Report' },
];

export default function CaseOverview() {
  const { caseId } = useParams();
  const { user, isDemo, signOut } = useAuth();
  const caseData = demoStore.getCase();
  const fir = demoStore.getFIR();
  const entities = demoStore.getEntities();
  const risk = demoStore.getRiskAssessment();

  return (
    <div className="min-h-screen bg-[#0d141d] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2a3a4a] flex flex-col fixed h-full">
        <div className="p-4 border-b border-[#2a3a4a] flex items-center gap-2">
          <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7">
            <circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/>
            <ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/>
            <circle cx="24" cy="24" r="4" fill="#4cd7f6"/>
            <circle cx="24" cy="24" r="1.5" fill="#0d141d"/>
          </svg>
          <span className="font-bold">Netra</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Dashboard
          </Link>
          <div className="pt-2 pb-1 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Case</div>
          {NAV.map(n => (
            <Link
              key={n.path}
              to={`/cases/${caseId}${n.path}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2a3a4a]">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#4cd7f6]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64">
        <header className="border-b border-[#2a3a4a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10">
          <div>
            <h1 className="text-lg font-bold">{caseData.title}</h1>
            <p className="text-xs text-gray-400 font-mono">{caseData.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 px-2 py-0.5 rounded uppercase tracking-wider">
              {isDemo ? 'Prototype — 1 FIR' : caseData.source}
            </span>
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">{caseData.status}</span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Prototype Banner */}
          <div className="bg-[#4cd7f6]/5 border border-[#4cd7f6]/20 rounded-xl p-4">
            <p className="text-sm text-[#4cd7f6] font-medium">NETRA — Prototype | Karnataka FIR Dataset — 1 Record</p>
            <p className="text-xs text-gray-400 mt-1">This case contains one FIR from the Karnataka Police FIR Dataset. All entities, relationships, and analytics are derived from this single record.</p>
          </div>

          {/* Case Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-5">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Case Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Case ID</span><span className="font-mono">{caseData.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Title</span><span>{caseData.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="text-green-400">{caseData.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Priority</span><span className="text-yellow-400">{caseData.priority}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Source</span><span className="text-xs text-right max-w-[180px]">{caseData.source}</span></div>
              </div>
            </div>

            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-5">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">FIR Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">FIR Number</span><span className="font-mono text-xs">{fir.fir_number}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Crime</span><span>{fir.crime_group_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">District</span><span>{fir.district_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date</span><span>{fir.fir_day}/{fir.fir_month}/{fir.fir_year}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">IO</span><span className="text-xs">{fir.io_name}</span></div>
              </div>
            </div>

            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-5">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Risk Assessment</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl font-bold text-[#4cd7f6]">{risk?.risk_score || 0}</div>
                <div>
                  <div className="text-xs text-gray-400">out of 100</div>
                  <div className={`text-sm font-semibold ${risk?.risk_level === 'HIGH' ? 'text-red-400' : risk?.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {risk?.risk_level || 'N/A'}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">Investigative prioritization only</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Victims', value: fir.victim_count, icon: 'person' },
              { label: 'Accused', value: fir.accused_count, icon: 'group' },
              { label: 'Arrested', value: fir.arrested_count, icon: 'verified_user' },
              { label: 'Entities', value: entities.length, icon: 'hub' },
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

          {/* Description */}
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-5">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-300">{caseData.description}</p>
          </div>

          {/* Quick Nav */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: `/cases/${caseId}/fir`, icon: 'description', label: 'View FIR' },
              { to: `/cases/${caseId}/graph`, icon: 'hub', label: 'Knowledge Graph' },
              { to: `/cases/${caseId}/analytics`, icon: 'analytics', label: 'Analytics' },
              { to: `/cases/${caseId}/report`, icon: 'summarize', label: 'Generate Report' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 hover:border-[#4cd7f6]/30 transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4cd7f6]">{a.icon}</span>
                <span className="text-sm">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
