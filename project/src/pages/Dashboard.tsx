import { Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';

export default function Dashboard() {
  const { user, isDemo, signOut } = useAuth();
  const caseData = demoStore.getCase();
  const fir = demoStore.getFIR();
  const entities = demoStore.getEntities();
  const relationships = demoStore.getRelationships();
  const evidence = demoStore.getEvidence();

  const stats = [
    { label: 'Total Cases', value: 1, icon: 'folder', color: 'text-[#4cd7f6]' },
    { label: 'Total FIRs', value: 1, icon: 'description', color: 'text-[#4cd7f6]' },
    { label: 'Entities', value: entities.length, icon: 'hub', color: 'text-[#4cd7f6]' },
    { label: 'Relationships', value: relationships.length, icon: 'lan', color: 'text-[#4cd7f6]' },
    { label: 'Evidence', value: evidence.length, icon: 'folder_shared', color: 'text-[#4cd7f6]' },
  ];

  return (
    <div className="min-h-screen bg-[#0d141d] text-white">
      {/* Header */}
      <header className="border-b border-[#2a3a4a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
            <circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/>
            <ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/>
            <circle cx="24" cy="24" r="4" fill="#4cd7f6"/>
            <circle cx="24" cy="24" r="1.5" fill="#0d141d"/>
          </svg>
          <span className="font-bold text-lg">Netra</span>
          {isDemo && (
            <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 px-2 py-0.5 rounded uppercase tracking-wider">
              Demo Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Prototype using one FIR record from Karnataka Police Dataset
          </p>
        </div>

        {/* Prototype Banner */}
        <div className="bg-[#4cd7f6]/5 border border-[#4cd7f6]/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#4cd7f6]">info</span>
          <div>
            <p className="text-sm font-medium text-[#4cd7f6]">NETRA — Prototype</p>
            <p className="text-xs text-gray-400">Karnataka FIR Dataset — 1 Record. All data flows from a single FIR.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</span>
                <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Case Card */}
        <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center justify-between">
            <h2 className="font-semibold">Active Cases</h2>
            <span className="text-xs text-gray-400">1 case</span>
          </div>
          <Link
            to={`/cases/${caseData.id}`}
            className="block px-6 py-4 hover:bg-[#2a3a4a]/30 transition-colors border-b border-[#2a3a4a]/50 last:border-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4cd7f6]">folder</span>
                </div>
                <div>
                  <p className="font-medium">{caseData.title}</p>
                  <p className="text-xs text-gray-400 font-mono">{caseData.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 uppercase tracking-wider">
                    {caseData.priority}
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-4 text-xs text-gray-400">
              <span>Status: <span className="text-white">{caseData.status}</span></span>
              <span>Crime: <span className="text-white">{fir.crime_group_name}</span></span>
              <span>District: <span className="text-white">{fir.district_name}</span></span>
              <span>IO: <span className="text-white">{fir.io_name}</span></span>
            </div>
          </Link>
        </div>

        {/* FIR Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">description</span>
              FIR Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">FIR Number</span><span className="font-mono">{fir.fir_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Type</span><span>{fir.fir_type || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Stage</span><span>{fir.fir_stage || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Complaint Mode</span><span>{fir.complaint_mode || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Date</span><span>{fir.fir_day}/{fir.fir_month}/{fir.fir_year}</span></div>
            </div>
          </div>

          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">gavel</span>
              Crime Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Crime Group</span><span>{fir.crime_group_name || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Crime Head</span><span>{fir.crime_head_name || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Act/Section</span><span>{fir.act_section || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">District</span><span>{fir.district_name || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Place</span><span className="text-right max-w-[200px]">{fir.place_of_offence || 'Not Available'}</span></div>
            </div>
          </div>

          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">groups</span>
              Victim & Accused
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Victim Count</span><span>{fir.victim_count}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Accused Count</span><span>{fir.accused_count}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Arrested</span><span>{fir.arrested_count}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Chargesheeted</span><span>{fir.accused_chargesheeted}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Convictions</span><span>{fir.conviction_count}</span></div>
            </div>
          </div>

          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">location_on</span>
              Location
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">District</span><span>{fir.district_name || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Place</span><span className="text-right max-w-[200px]">{fir.place_of_offence || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Beat</span><span>{fir.beat_name || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Distance from PS</span><span>{fir.distance_from_ps || 'Not Available'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Coordinates</span><span className="font-mono text-xs">{fir.latitude && fir.longitude ? `${fir.latitude}, ${fir.longitude}` : 'Not Available'}</span></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: `/cases/${caseData.id}/fir`, icon: 'description', label: 'FIR Details' },
            { to: `/cases/${caseData.id}/graph`, icon: 'hub', label: 'Knowledge Graph' },
            { to: `/cases/${caseData.id}/analytics`, icon: 'analytics', label: 'Analytics' },
            { to: `/cases/${caseData.id}/evidence`, icon: 'folder_shared', label: 'Evidence' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 hover:border-[#4cd7f6]/30 transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined text-[#4cd7f6]">{a.icon}</span>
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
