import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';
import { getCases, getFIRsByCase, getEntities, getRelationships, getEvidence } from '@/lib/data';
import type { Case, FIR, Entity, Relationship, EvidenceRecord } from '@/lib/types';
import Layout from '@/components/Layout';

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count}</>;
}

const TIMELINE_EVENTS = [
  { date: '2026-08-01', text: 'Rahul Verma begins using number +91 9XXXX-11122' },
  { date: '2026-08-04', text: 'Rahul Verma calls Sameer Khan' },
  { date: '2026-08-05', text: 'Sameer Khan visits Delhi Railway Station' },
  { date: '2026-08-06', text: 'Sameer Khan meets Mohit Sharma' },
  { date: '2026-08-07', text: 'Mohit Sharma associates with Deepak Rana' },
  { date: '2026-08-09', text: 'Rahul Verma uses vehicle DL 3C AK 4471 near Delhi Railway Station' },
  { date: '2026-08-10', text: 'Deepak Rana and Karan Malik in repeated contact' },
  { date: '2026-08-12', text: '\u20b98,50,000 transaction linked to Sector 18 Warehouse' },
];

const KEY_INDIVIDUALS = [
  { name: 'Rahul Verma', role: 'Central Connector', score: 94, color: '#ef4444' },
  { name: 'Mohit Sharma', role: 'Bridge', score: 84, color: '#f97316' },
  { name: 'Sameer Khan', role: 'Core Member', score: 71, color: '#eab308' },
  { name: 'Deepak Rana', role: 'Core Member', score: 63, color: '#eab308' },
  { name: 'Anil Yadav', role: 'Peripheral', score: 38, color: '#22c55e' },
  { name: 'Karan Malik', role: 'Peripheral', score: 29, color: '#22c55e' },
  { name: 'S. Khan', role: '', score: 0, color: '#6b7280' },
];

const PRIORITY_FACTORS = [
  'High network centrality (Rahul Verma, Mohit Sharma)',
  'Multiple community connections via 2 bridge entities',
  'Unusual communication increase detected 2026-08-04',
  'Recent financial anomaly (\u20b98,50,000 transfer)',
  'Repeated association with a previously flagged organization',
];

export default function Dashboard() {
  const { isDemo } = useAuth();
  const [cases, setCases] = useState<Case[]>([demoStore.getCase()]);
  const [fir, setFir] = useState<FIR>(demoStore.getFIR());
  const [entities, setEntities] = useState<Entity[]>(demoStore.getEntities());
  const [relationships, setRelationships] = useState<Relationship[]>(demoStore.getRelationships());
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const c = await getCases();
      if (cancelled) return;
      setCases(c);
      if (c[0]) {
        const [firs, ents, rels, evi] = await Promise.all([
          getFIRsByCase(c[0].id),
          getEntities(c[0].id),
          getRelationships(c[0].id),
          getEvidence(c[0].id),
        ]);
        if (cancelled) return;
        if (firs[0]) setFir(firs[0]);
        setEntities(ents);
        setRelationships(rels);
        setEvidence(evi);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const caseData = cases[0] ?? demoStore.getCase();

  const stats = [
    { label: 'Cases', value: cases.length, icon: 'folder', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'FIRs', value: 1, icon: 'description', gradient: 'from-[#4cd7f6]/10 to-[#4cd7f6]/5' },
    { label: 'Entities', value: entities.length, icon: 'hub', gradient: 'from-purple-500/10 to-purple-500/5' },
    { label: 'Relations', value: relationships.length, icon: 'lan', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Evidence', value: evidence.length, icon: 'folder_shared', gradient: 'from-emerald-500/10 to-emerald-500/5' },
  ];

  type InfoItem = { label: string; value: string | number | null; mono?: boolean; color?: string; truncate?: boolean };
  type InfoCard = { title: string; icon: string; items: InfoItem[] };
  const infoCards: InfoCard[] = [
    {
      title: 'FIR Information', icon: 'description',
      items: [
        { label: 'FIR Number', value: fir.fir_number, mono: true },
        { label: 'Type', value: fir.fir_type },
        { label: 'Stage', value: fir.fir_stage },
        { label: 'Complaint Mode', value: fir.complaint_mode },
        { label: 'Date', value: `${fir.fir_day}/${fir.fir_month}/${fir.fir_year}` },
      ],
    },
    {
      title: 'Crime Information', icon: 'gavel',
      items: [
        { label: 'Crime Group', value: fir.crime_group_name },
        { label: 'Crime Head', value: fir.crime_head_name },
        { label: 'Act/Section', value: fir.act_section },
        { label: 'District', value: fir.district_name },
        { label: 'Place', value: fir.place_of_offence, truncate: true },
      ],
    },
    {
      title: 'Victim & Accused', icon: 'groups',
      items: [
        { label: 'Victims', value: fir.victim_count, color: 'text-[#4cd7f6]' },
        { label: 'Accused', value: fir.accused_count, color: 'text-amber-400' },
        { label: 'Arrested', value: fir.arrested_count, color: 'text-emerald-400' },
        { label: 'Chargesheeted', value: fir.accused_chargesheeted, color: 'text-purple-400' },
        { label: 'Convictions', value: fir.conviction_count, color: 'text-red-400' },
      ],
    },
    {
      title: 'Location', icon: 'location_on',
      items: [
        { label: 'District', value: fir.district_name },
        { label: 'Place', value: fir.place_of_offence, truncate: true },
        { label: 'Beat', value: fir.beat_name },
        { label: 'Distance from PS', value: fir.distance_from_ps },
        { label: 'Coordinates', value: fir.latitude && fir.longitude ? `${fir.latitude}, ${fir.longitude}` : 'N/A', mono: true },
      ],
    },
  ];

  return (
    <Layout caseId={caseData.id}>
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500">{caseData.id}</span>
            <span className="text-sm font-bold">{caseData.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">{caseData.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 px-3 py-1 rounded-lg uppercase tracking-wider font-medium">Demo data</span>
          )}
          <div className="text-right">
            <span className="text-2xl font-extrabold text-amber-400">82</span>
            <span className="text-[10px] text-gray-500 ml-1">PRIORITY SCORE</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Network Summary */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Network Summary</h2>
            <span className="text-[10px] text-gray-500">auto-generated from graph data</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Network contains {entities.length} entities and {relationships.length} relationships across 3 detected communities. Rahul Verma has the highest degree centrality; Mohit Sharma acts as the sole bridge between Community 1 and Community 2. Five unusual activities were detected in the past 14 days, most recently an {'\u20b9'}8,50,000 transaction on 2026-08-12.
          </p>
        </div>

        {/* Network Graph Mini */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Network Graph</h2>
              <div className="flex items-center gap-3 ml-4">
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Person</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Vehicle</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Location</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Organization</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Phone</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Transaction</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/cases/${caseData.id}/graph`} className="px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-lg text-[10px] transition-all">Reset view</Link>
              <button className="px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-lg text-[10px] transition-all">Recompute centrality & communities</button>
              <Link to={`/cases/${caseData.id}/graph`} className="px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-lg text-[10px] transition-all">Open full graph →</Link>
            </div>
          </div>
          <div className="p-6 flex items-center justify-center" style={{ height: 320, background: 'radial-gradient(circle at 50% 50%, rgba(76, 215, 246, 0.03), transparent 70%)' }}>
            {/* Mini graph visualization - simplified static version */}
            <svg viewBox="0 0 600 280" className="w-full max-w-2xl opacity-80">
              {/* Edges */}
              <line x1="300" y1="100" x2="200" y2="140" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="300" y1="100" x2="400" y2="80" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="300" y1="100" x2="350" y2="180" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="200" y1="140" x2="150" y2="200" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="400" y1="80" x2="450" y2="140" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="350" y1="180" x2="280" y2="220" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="350" y1="180" x2="420" y2="230" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="200" y1="140" x2="280" y2="220" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="450" y1="140" x2="420" y2="230" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              <line x1="150" y1="200" x2="280" y2="220" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
              {/* Nodes */}
              <circle cx="300" cy="100" r="12" fill="#0d141d" stroke="#eab308" strokeWidth="1.5" />
              <circle cx="300" cy="100" r="4" fill="#eab308" />
              <text x="300" y="120" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Rahul Verma</text>
              <circle cx="200" cy="140" r="10" fill="#0d141d" stroke="#4cd7f6" strokeWidth="1.5" />
              <circle cx="200" cy="140" r="3" fill="#4cd7f6" />
              <text x="200" y="158" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Sameer Khan</text>
              <circle cx="400" cy="80" r="10" fill="#0d141d" stroke="#4cd7f6" strokeWidth="1.5" />
              <circle cx="400" cy="80" r="3" fill="#4cd7f6" />
              <text x="400" y="72" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Karan Malik</text>
              <circle cx="350" cy="180" r="10" fill="#0d141d" stroke="#4cd7f6" strokeWidth="1.5" />
              <circle cx="350" cy="180" r="3" fill="#4cd7f6" />
              <text x="350" y="198" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Mohit Sharma</text>
              <circle cx="150" cy="200" r="10" fill="#0d141d" stroke="#22c55e" strokeWidth="1.5" />
              <circle cx="150" cy="200" r="3" fill="#22c55e" />
              <text x="150" y="218" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Connaught Place</text>
              <circle cx="450" cy="140" r="10" fill="#0d141d" stroke="#4cd7f6" strokeWidth="1.5" />
              <circle cx="450" cy="140" r="3" fill="#4cd7f6" />
              <text x="450" y="158" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Anil Yadav</text>
              <circle cx="280" cy="220" r="10" fill="#0d141d" stroke="#22c55e" strokeWidth="1.5" />
              <circle cx="280" cy="220" r="3" fill="#22c55e" />
              <text x="280" y="238" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Sector 18 Warehouse</text>
              <circle cx="420" cy="230" r="10" fill="#0d141d" stroke="#4cd7f6" strokeWidth="1.5" />
              <circle cx="420" cy="230" r="3" fill="#4cd7f6" />
              <text x="420" y="248" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Deepak Rana</text>
              <circle cx="220" cy="60" r="10" fill="#0d141d" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="220" cy="60" r="3" fill="#a855f7" />
              <text x="220" y="52" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">DL 3C AK 4471</text>
              <circle cx="380" cy="30" r="10" fill="#0d141d" stroke="#22c55e" strokeWidth="1.5" />
              <circle cx="380" cy="30" r="3" fill="#22c55e" />
              <text x="380" y="22" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="Inter">Delhi Railway Station</text>
            </svg>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card group stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">{s.icon}</span>
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">
                <AnimatedCounter value={s.value} />
              </p>
            </div>
          ))}
        </div>

        {/* Relationship Timeline + Key Individuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Relationship Timeline */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04]">
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Relationship Timeline</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {TIMELINE_EVENTS.map((ev, i) => (
                <div key={i} className="px-5 py-2.5 flex items-center gap-4 hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="text-[10px] font-mono text-[var(--accent)] whitespace-nowrap">{ev.date}</span>
                  <span className="text-xs text-gray-300">{ev.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Individuals */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Key Individuals</h2>
              <span className="text-[10px] text-gray-500">by centrality — degree 30% / PageRank 70%</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {KEY_INDIVIDUALS.map((person, i) => (
                <div key={i} className="px-5 py-2.5 flex items-center gap-3 hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="text-xs font-medium text-gray-300 min-w-[100px]">{person.name}</span>
                  {person.role && <span className="text-[9px] text-gray-500 min-w-[80px]">{person.role}</span>}
                  <span className="text-[10px] font-mono text-gray-400 w-6 text-right">{person.score}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${person.score}%`, background: person.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Score Breakdown */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Priority Score Breakdown</h2>
            <span className="text-[10px] text-gray-500">explainable, not a verdict</span>
          </div>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <span className="text-4xl font-extrabold text-amber-400">82</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
            <div className="space-y-1.5">
              {PRIORITY_FACTORS.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="text-[var(--accent)]">+</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Card */}
        <div className="glass-card-hover stagger-item overflow-hidden" style={{ animationDelay: '0.3s' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--accent)' }}>folder</span>
              </div>
              <div>
                <h2 className="font-bold text-base">Active Cases</h2>
                <p className="text-xs text-gray-400">{cases.length} case{cases.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <Link to={`/cases/${caseData.id}`} className="block px-6 py-5 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300" style={{ background: 'var(--accent-muted)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--accent)' }}>folder</span>
                </div>
                <div>
                  <p className="font-bold group-hover:text-[var(--accent)] transition-colors">{caseData.title}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{caseData.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-semibold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{caseData.priority}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-all duration-300" style={{ color: 'var(--text-muted)' }}>chevron_right</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">{caseData.status}</span>
              </div>
              <div><span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Crime: </span><span className="font-bold">{fir.crime_group_name}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>District: </span><span className="font-bold">{fir.district_name}</span></div>
              <div><span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>IO: </span><span className="font-bold">{fir.io_name}</span></div>
            </div>
          </Link>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {infoCards.map((card, ci) => (
            <div key={card.title} className="glass-card stagger-item overflow-hidden" style={{ animationDelay: `${0.35 + ci * 0.05}s` }}>
              <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: 'var(--border)' }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--accent)' }}>{card.icon}</span>
                <span className="text-base font-bold">{card.title}</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {card.items.map(item => (
                  <div key={item.label} className="px-5 py-2.5 flex items-center justify-between text-sm transition-colors">
                    <span className="font-semibold text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className={`text-sm font-bold ${item.mono ? 'font-mono' : ''} ${item.color || ''} ${item.truncate ? 'text-right max-w-[180px] truncate' : ''}`}>
                      {item.value || 'Not Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-item" style={{ animationDelay: '0.6s' }}>
          {[
            { to: `/cases/${caseData.id}/fir`, icon: 'description', label: 'FIR Details', desc: 'View complete FIR data' },
            { to: `/cases/${caseData.id}/graph`, icon: 'hub', label: 'Knowledge Graph', desc: 'Interactive entity graph' },
            { to: `/cases/${caseData.id}/analytics`, icon: 'analytics', label: 'Analytics', desc: 'Risk & investigation' },
            { to: `/cases/${caseData.id}/evidence`, icon: 'folder_shared', label: 'Evidence', desc: 'SHA-256 verified files' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="glass-card-hover p-5 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: 'var(--accent-muted)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--accent)' }}>{a.icon}</span>
                </div>
                <div>
                  <span className="text-base font-bold block group-hover:text-[var(--accent)] transition-colors">{a.label}</span>
                  <span className="text-xs text-gray-400">{a.desc}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
