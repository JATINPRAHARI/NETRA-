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

export default function Dashboard() {
  const { user, isDemo } = useAuth();
  const [cases, setCases] = useState<Case[]>([demoStore.getCase()]);
  const [fir, setFir] = useState<FIR>(demoStore.getFIR());
  const [entities, setEntities] = useState<Entity[]>(demoStore.getEntities());
  const [relationships, setRelationships] = useState<Relationship[]>(demoStore.getRelationships());
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    async function load() {
      const c = await getCases();
      setCases(c);
      if (c[0]) {
        const [firs, ents, rels, evi] = await Promise.all([
          getFIRsByCase(c[0].id),
          getEntities(c[0].id),
          getRelationships(c[0].id),
          getEvidence(c[0].id),
        ]);
        if (firs[0]) setFir(firs[0]);
        setEntities(ents);
        setRelationships(rels);
        setEvidence(evi);
      }
    }
    load();
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
      title: 'FIR Information',
      icon: 'description',
      items: [
        { label: 'FIR Number', value: fir.fir_number, mono: true },
        { label: 'Type', value: fir.fir_type },
        { label: 'Stage', value: fir.fir_stage },
        { label: 'Complaint Mode', value: fir.complaint_mode },
        { label: 'Date', value: `${fir.fir_day}/${fir.fir_month}/${fir.fir_year}` },
      ],
    },
    {
      title: 'Crime Information',
      icon: 'gavel',
      items: [
        { label: 'Crime Group', value: fir.crime_group_name },
        { label: 'Crime Head', value: fir.crime_head_name },
        { label: 'Act/Section', value: fir.act_section },
        { label: 'District', value: fir.district_name },
        { label: 'Place', value: fir.place_of_offence, truncate: true },
      ],
    },
    {
      title: 'Victim & Accused',
      icon: 'groups',
      items: [
        { label: 'Victims', value: fir.victim_count, color: 'text-[#4cd7f6]' },
        { label: 'Accused', value: fir.accused_count, color: 'text-amber-400' },
        { label: 'Arrested', value: fir.arrested_count, color: 'text-emerald-400' },
        { label: 'Chargesheeted', value: fir.accused_chargesheeted, color: 'text-purple-400' },
        { label: 'Convictions', value: fir.conviction_count, color: 'text-red-400' },
      ],
    },
    {
      title: 'Location',
      icon: 'location_on',
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
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Karnataka FIR Dataset — 1 Record</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 px-3 py-1 rounded-lg uppercase tracking-wider font-medium">
              Demo Mode
            </span>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
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
          <Link
            to={`/cases/${caseData.id}`}
            className="block px-6 py-5 transition-all duration-300 group"
            style={{ '--hover-bg': 'var(--bg-card-hover)' } as React.CSSProperties}
          >
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
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-semibold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  {caseData.priority}
                </span>
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
