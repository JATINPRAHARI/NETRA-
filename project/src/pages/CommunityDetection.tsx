import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type BridgeEntity = { name: string; community: string; crossLinks: number };
type Community = { name: string; entityCount: number; members: { name: string; type: string; bridge?: boolean }[] };

const BRIDGE_ENTITIES: BridgeEntity[] = [
  { name: 'Sameer Khan', community: 'Community 1', crossLinks: 1 },
  { name: 'Mohit Sharma', community: 'Community 2', crossLinks: 1 },
];

const DEMO_COMMUNITIES: Community[] = [
  {
    name: 'COMMUNITY 1', entityCount: 8,
    members: [
      { name: 'Rahul Verma', type: 'person' },
      { name: 'Sameer Khan', type: 'person', bridge: true },
      { name: 'Anil Yadav', type: 'person' },
      { name: 'S. Khan', type: 'person' },
      { name: 'DL 3C AK 4471', type: 'vehicle' },
      { name: 'Delhi Railway Station', type: 'location' },
      { name: 'Connaught Place', type: 'location' },
      { name: '+91 9XXXX-11122', type: 'phone' },
    ],
  },
  {
    name: 'COMMUNITY 2', entityCount: 6,
    members: [
      { name: 'Mohit Sharma', type: 'person', bridge: true },
      { name: 'Deepak Rana', type: 'person' },
      { name: 'Karan Malik', type: 'person' },
      { name: 'Sector 18 Warehouse', type: 'location' },
      { name: 'Northline Logistics Pvt Ltd', type: 'organization' },
      { name: '\u20b98,50,000 transfer', type: 'transaction' },
    ],
  },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  person: { icon: 'person', color: 'text-blue-400' },
  vehicle: { icon: 'directions_car', color: 'text-purple-400' },
  location: { icon: 'location_on', color: 'text-emerald-400' },
  organization: { icon: 'business', color: 'text-amber-400' },
  phone: { icon: 'phone', color: 'text-cyan-400' },
  transaction: { icon: 'payments', color: 'text-rose-400' },
};

export default function CommunityDetection() {
  const { caseData, entities, relationships, loading } = useCaseData();
  const [recomputing, setRecomputing] = useState(false);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Community & Group Detection</h1>
          <p className="text-xs text-gray-500">{DEMO_COMMUNITIES.length} communities detected. {BRIDGE_ENTITIES.length} entities bridge more than one community.</p>
        </div>
        <button onClick={() => { setRecomputing(true); setTimeout(() => setRecomputing(false), 2000); }} className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
          {recomputing ? 'Computing...' : 'RECOMPUTE (LABEL PROPAGATION)'}
        </button>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Bridge Entities */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Bridge Entities</h2>
            <span className="text-[10px] text-gray-500">connect otherwise separate communities — highest investigative value</span>
          </div>
          <div className="space-y-2">
            {BRIDGE_ENTITIES.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                  <span className="text-xs font-medium text-gray-300">{b.name}</span>
                  <span className="text-[10px] text-gray-500">({b.community})</span>
                </div>
                <span className="text-[10px] text-gray-500">{b.crossLinks} cross-community link</span>
              </div>
            ))}
          </div>
        </div>

        {/* Communities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DEMO_COMMUNITIES.map((comm, ci) => (
            <div key={ci} className="glass-card overflow-hidden stagger-item" style={{ animationDelay: `${ci * 0.1}s` }}>
              <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-xs font-bold">{comm.name}</span>
                <span className="text-[10px] text-gray-500">{comm.entityCount} entities</span>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {comm.members.map((m, mi) => {
                  const typeInfo = TYPE_ICONS[m.type] || { icon: 'help', color: 'text-gray-400' };
                  return (
                    <div key={mi} className="px-5 py-2.5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">&#9679;</span>
                        <span className="text-xs font-medium text-gray-300">{m.name}</span>
                        {m.bridge && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-medium border border-[var(--accent)]/20">BRIDGE</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[14px] ${typeInfo.color}`}>{typeInfo.icon}</span>
                        <span className="text-[10px] text-gray-500">{m.type}</span>
                      </div>
                    </div>
                  );
                })}
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
