import { Link } from 'react-router-dom';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const SECTIONS = [
  { title: 'FIR Information', icon: 'description', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'FIR Number', value: f.fir_number },
    { label: 'FIR Type', value: f.fir_type },
    { label: 'FIR Stage', value: f.fir_stage },
    { label: 'Complaint Mode', value: f.complaint_mode },
    { label: 'Offence Duration', value: f.offence_duration },
    { label: 'Year', value: f.fir_year },
    { label: 'Month', value: f.fir_month },
    { label: 'Day', value: f.fir_day },
  ]},
  { title: 'Crime Information', icon: 'gavel', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'Crime Group', value: f.crime_group_name },
    { label: 'Crime Head', value: f.crime_head_name },
    { label: 'Act/Section', value: f.act_section },
  ]},
  { title: 'Location', icon: 'location_on', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'District', value: f.district_name },
    { label: 'Place of Offence', value: f.place_of_offence },
    { label: 'Village/Area', value: f.village_area_name },
    { label: 'Beat', value: f.beat_name },
    { label: 'Distance from PS', value: f.distance_from_ps },
    { label: 'Latitude', value: f.latitude },
    { label: 'Longitude', value: f.longitude },
  ]},
  { title: 'Victim Information', icon: 'person', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'Total Victims', value: f.victim_count },
    { label: 'Male', value: f.male_victims },
    { label: 'Female', value: f.female_victims },
    { label: 'Boy', value: f.boy_victims },
    { label: 'Girl', value: f.girl_victims },
    { label: 'Age 0', value: f.age_0_victims },
  ]},
  { title: 'Accused Information', icon: 'group', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'Total Accused', value: f.accused_count },
    { label: 'Arrested Male', value: f.arrested_male },
    { label: 'Arrested Female', value: f.arrested_female },
    { label: 'Total Arrested', value: f.arrested_count },
    { label: 'Chargesheeted', value: f.accused_chargesheeted },
    { label: 'Convictions', value: f.conviction_count },
  ]},
  { title: 'Investigation Information', icon: 'search', fields: (f: ReturnType<typeof useCaseData>['fir']) => [
    { label: 'Investigating Officer', value: f.io_name },
    { label: 'KGID', value: f.kgid },
    { label: 'Internal IO', value: f.internal_io },
    { label: 'Unit', value: f.unit_name },
    { label: 'Unit ID', value: f.unit_id },
  ]},
];

export default function FirDetail() {
  const { caseData, fir, loading } = useCaseData();

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading FIR data...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span className="text-gray-600">/</span>
          <Link to={`/cases/${caseData.id}`} className="hover:text-white transition-colors">Case</Link>
          <span className="text-gray-600">/</span>
          <span className="text-white">FIR Details</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">FIR Detail — {fir.fir_number}</h1>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Map */}
        {fir.latitude && fir.longitude && (
          <div className="glass-card overflow-hidden stagger-item">
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">map</span>
              <span className="text-sm font-medium">FIR Location</span>
              <span className="text-xs text-gray-500 ml-auto font-mono">{fir.latitude}, {fir.longitude}</span>
            </div>
            <div className="h-72 bg-[#0a0f18] flex items-center justify-center relative grid-bg">
              <div className="relative text-center">
                <div className="w-5 h-5 bg-[#4cd7f6] rounded-full mx-auto mb-3 animate-pulse-glow shadow-[0_0_30px_rgba(76,215,246,0.4)]"></div>
                <div className="glass-card px-4 py-3 text-xs">
                  <p className="font-mono text-[#4cd7f6]">{fir.latitude}, {fir.longitude}</p>
                  <p className="text-gray-400 mt-1">{fir.place_of_offence}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIR Sections */}
        {SECTIONS.map((section, si) => (
          <div key={section.title} className="glass-card overflow-hidden stagger-item" style={{ animationDelay: `${si * 0.05}s` }}>
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">{section.icon}</span>
              </div>
              <span className="text-sm font-medium">{section.title}</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {section.fields(fir).map(f => (
                <div key={String(f.label)} className="px-5 py-2.5 flex items-center justify-between text-sm hover:bg-white/[0.01] transition-colors">
                  <span className="text-gray-400 text-xs">{f.label}</span>
                  <span className="font-mono text-xs text-white">{f.value !== null && f.value !== undefined && f.value !== '' ? String(f.value) : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </Layout>
  );
}
