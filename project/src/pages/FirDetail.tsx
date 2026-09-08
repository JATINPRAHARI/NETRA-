import { useParams, Link } from 'react-router-dom';
import { demoStore } from '@/lib/auth';

const SECTIONS = [
  { title: 'FIR Information', icon: 'description', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'FIR Number', value: f.fir_number },
    { label: 'FIR Type', value: f.fir_type },
    { label: 'FIR Stage', value: f.fir_stage },
    { label: 'Complaint Mode', value: f.complaint_mode },
    { label: 'Offence Duration', value: f.offence_duration },
    { label: 'Year', value: f.fir_year },
    { label: 'Month', value: f.fir_month },
    { label: 'Day', value: f.fir_day },
  ]},
  { title: 'Crime Information', icon: 'gavel', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'Crime Group', value: f.crime_group_name },
    { label: 'Crime Head', value: f.crime_head_name },
    { label: 'Act/Section', value: f.act_section },
  ]},
  { title: 'Location', icon: 'location_on', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'District', value: f.district_name },
    { label: 'Place of Offence', value: f.place_of_offence },
    { label: 'Village/Area', value: f.village_area_name },
    { label: 'Beat', value: f.beat_name },
    { label: 'Distance from PS', value: f.distance_from_ps },
    { label: 'Latitude', value: f.latitude },
    { label: 'Longitude', value: f.longitude },
  ]},
  { title: 'Victim Information', icon: 'person', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'Total Victims', value: f.victim_count },
    { label: 'Male', value: f.male_victims },
    { label: 'Female', value: f.female_victims },
    { label: 'Boy', value: f.boy_victims },
    { label: 'Girl', value: f.girl_victims },
    { label: 'Age 0', value: f.age_0_victims },
  ]},
  { title: 'Accused Information', icon: 'group', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'Total Accused', value: f.accused_count },
    { label: 'Arrested Male', value: f.arrested_male },
    { label: 'Arrested Female', value: f.arrested_female },
    { label: 'Total Arrested', value: f.arrested_count },
    { label: 'Chargesheeted', value: f.accused_chargesheeted },
    { label: 'Convictions', value: f.conviction_count },
  ]},
  { title: 'Investigation Information', icon: 'search', fields: (f: ReturnType<typeof demoStore.getFIR>) => [
    { label: 'Investigating Officer', value: f.io_name },
    { label: 'KGID', value: f.kgid },
    { label: 'Internal IO', value: f.internal_io },
    { label: 'Unit', value: f.unit_name },
    { label: 'Unit ID', value: f.unit_id },
  ]},
];

export default function FirDetail() {
  const { caseId } = useParams();
  const fir = demoStore.getFIR();

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
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <span>/</span>
            <Link to={`/cases/${caseId}`} className="hover:text-white">Case</Link>
            <span>/</span>
            <span className="text-white">FIR Details</span>
          </div>
          <h1 className="text-lg font-bold">FIR Detail — {fir.fir_number}</h1>
          <p className="text-xs text-gray-400">Source: Karnataka Police FIR Dataset</p>
        </header>

        <div className="p-6 space-y-6">
          {/* Map */}
          {fir.latitude && fir.longitude && (
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a3a4a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">map</span>
                <span className="text-sm font-medium">FIR Location</span>
                <span className="text-xs text-gray-400 ml-auto font-mono">{fir.latitude}, {fir.longitude}</span>
              </div>
              <div className="h-64 bg-[#0d141d] flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 1px 1px, #4cd7f6 1px, transparent 0)', backgroundSize:'24px 24px'}}></div>
                <div className="relative text-center">
                  <div className="w-4 h-4 bg-[#4cd7f6] rounded-full mx-auto mb-2 animate-pulse shadow-[0_0_20px_rgba(76,215,246,0.5)]"></div>
                  <div className="bg-[#1a2332] border border-[#4cd7f6]/30 rounded-lg px-3 py-2 text-xs">
                    <p className="font-mono text-[#4cd7f6]">{fir.latitude}, {fir.longitude}</p>
                    <p className="text-gray-400 mt-0.5">{fir.place_of_offence}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FIR Sections */}
          {SECTIONS.map(section => (
            <div key={section.title} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a3a4a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">{section.icon}</span>
                <span className="text-sm font-medium">{section.title}</span>
              </div>
              <div className="divide-y divide-[#2a3a4a]/50">
                {section.fields(fir).map(f => (
                  <div key={String(f.label)} className="px-5 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-gray-400">{f.label}</span>
                    <span className="font-mono text-xs">{f.value !== null && f.value !== undefined && f.value !== '' ? String(f.value) : 'Not Available'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
