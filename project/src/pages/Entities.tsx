import { useParams, Link } from 'react-router-dom';
import { demoStore } from '@/lib/auth';

const TYPE_COLORS: Record<string, string> = {
  FIR: 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20',
  District: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PoliceUnit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CrimeGroup: 'bg-red-500/10 text-red-400 border-red-500/20',
  CrimeHead: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Location: 'bg-green-500/10 text-green-400 border-green-500/20',
  InvestigatingOfficer: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ActSection: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const TYPE_ICONS: Record<string, string> = {
  FIR: 'description', District: 'location_city', PoliceUnit: 'local_police',
  CrimeGroup: 'gavel', CrimeHead: 'report', Location: 'location_on',
  InvestigatingOfficer: 'person', ActSection: 'balance',
};

export default function Entities() {
  const { caseId } = useParams();
  const entities = demoStore.getEntities();
  const relationships = demoStore.getRelationships();

  const grouped = entities.reduce((acc, e) => {
    (acc[e.type] = acc[e.type] || []).push(e);
    return acc;
  }, {} as Record<string, typeof entities>);

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
          <h1 className="text-lg font-bold">Entities</h1>
          <p className="text-xs text-gray-400">{entities.length} entities extracted from FIR data</p>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-3 flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${TYPE_COLORS[type]?.split(' ')[1] || 'text-gray-400'}`}>{TYPE_ICONS[type] || 'help'}</span>
                <div>
                  <p className="text-lg font-bold">{items.length}</p>
                  <p className="text-[10px] text-gray-400 uppercase">{type}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Entity Cards */}
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] ${TYPE_COLORS[type]?.split(' ')[1]}`}>{TYPE_ICONS[type]}</span>
                {type} ({items.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(entity => (
                  <div key={entity.id} className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 hover:border-[#4cd7f6]/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${TYPE_COLORS[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          <span className="material-symbols-outlined text-[16px]">{TYPE_ICONS[type] || 'help'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entity.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{entity.id}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${TYPE_COLORS[type] || ''}`}>{type}</span>
                    </div>
                    {Object.keys(entity.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#2a3a4a]/50 space-y-1">
                        {Object.entries(entity.metadata).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-gray-500">{k}</span>
                            <span className="font-mono text-gray-300">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Relationships */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">lan</span>
              Relationships ({relationships.length})
            </h2>
            <div className="space-y-2">
              {relationships.map(rel => {
                const src = entities.find(e => e.id === rel.source_id);
                const tgt = entities.find(e => e.id === rel.target_id);
                return (
                  <div key={rel.id} className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="px-2 py-0.5 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded text-xs font-mono">{src?.type}</span>
                    <span className="text-gray-300 truncate max-w-[150px]">{src?.name}</span>
                    <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">arrow_forward</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{rel.type}</span>
                    <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">arrow_forward</span>
                    <span className="text-gray-300 truncate max-w-[150px]">{tgt?.name}</span>
                    <span className="px-2 py-0.5 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded text-xs font-mono">{tgt?.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
