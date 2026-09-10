import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const TYPE_COLORS: Record<string, string> = {
  FIR: '#4cd7f6', District: '#a855f7', PoliceUnit: '#3b82f6',
  CrimeGroup: '#ef4444', CrimeHead: '#f97316', Location: '#22c55e',
  InvestigatingOfficer: '#eab308', ActSection: '#ec4899',
};

const TYPE_COLORS_BG: Record<string, string> = {
  FIR: 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20',
  District: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PoliceUnit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CrimeGroup: 'bg-red-500/10 text-red-400 border-red-500/20',
  CrimeHead: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Location: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  InvestigatingOfficer: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ActSection: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const TYPE_ICONS: Record<string, string> = {
  FIR: 'description', District: 'location_city', PoliceUnit: 'local_police',
  CrimeGroup: 'gavel', CrimeHead: 'report', Location: 'location_on',
  InvestigatingOfficer: 'person', ActSection: 'balance',
};

export default function Entities() {
  const { caseData, entities, relationships, loading } = useCaseData();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const getConnectionCount = (entityId: string) =>
    relationships.filter(r => r.source_id === entityId || r.target_id === entityId).length;

  const filtered = search
    ? entities.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.type.toLowerCase().includes(search.toLowerCase()) ||
        Object.values(e.metadata).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
      )
    : entities;

  const grouped = filtered.reduce((acc, e) => {
    (acc[e.type] = acc[e.type] || []).push(e);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const sortedTypes = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading entities...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Entities</h1>
            <p className="text-xs text-gray-500">{entities.length} entities · {relationships.length} relationships extracted from FIR data</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entities by name, type, or metadata..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[var(--accent)]/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined text-[14px] text-gray-500">close</span>
            </button>
          )}
        </div>

        {/* Type Summary */}
        <div className="flex flex-wrap gap-2">
          {sortedTypes.map(([type, items]) => (
            <button
              key={type}
              onClick={() => setExpanded(expanded === type ? null : type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                expanded === type
                  ? `${TYPE_COLORS_BG[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`
                  : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" style={{ color: TYPE_COLORS[type] }}>{TYPE_ICONS[type] || 'help'}</span>
              {type}
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: TYPE_COLORS[type] + '15', color: TYPE_COLORS[type] }}>{items.length}</span>
            </button>
          ))}
        </div>

        {/* Entity Cards */}
        {view === 'grid' ? (
          sortedTypes.map(([type, items]) => (
            <div key={type}>
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]" style={{ color: TYPE_COLORS[type] }}>{TYPE_ICONS[type]}</span>
                {type} ({items.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((entity, i) => {
                  const conns = getConnectionCount(entity.id);
                  const isExpanded = expanded === type;
                  return (
                    <div key={entity.id} className={`glass-card-hover p-4 stagger-item transition-all ${isExpanded ? '' : 'hidden'}`} style={{ animationDelay: `${i * 0.03}s` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[type] + '30', background: TYPE_COLORS[type] + '10' }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: TYPE_COLORS[type] }}>{TYPE_ICONS[type] || 'help'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entity.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-mono">{entity.id}</span>
                              {conns > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-mono">{conns} conn</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
                          {Object.entries(entity.metadata as Record<string, unknown>).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-gray-500">{k}</span>
                              <span className="font-mono text-gray-300">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Show all items in collapsed view */}
              {expanded !== type && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((entity, i) => {
                    const conns = getConnectionCount(entity.id);
                    return (
                      <div key={entity.id} className="glass-card-hover p-4 stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[type] + '30', background: TYPE_COLORS[type] + '10' }}>
                              <span className="material-symbols-outlined text-[16px]" style={{ color: TYPE_COLORS[type] }}>{TYPE_ICONS[type] || 'help'}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{entity.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-500 font-mono">{entity.id}</span>
                                {conns > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-mono">{conns} conn</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
                            {Object.entries(entity.metadata as Record<string, unknown>).slice(0, 3).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-gray-500">{k}</span>
                                <span className="font-mono text-gray-300">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          /* List View */
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entity</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Type</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Connections</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((entity, i) => {
                  const conns = getConnectionCount(entity.id);
                  return (
                    <tr key={entity.id} className="hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.02}s` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[entity.type] + '30', background: TYPE_COLORS[entity.type] + '10' }}>
                            <span className="material-symbols-outlined text-[12px]" style={{ color: TYPE_COLORS[entity.type] }}>{TYPE_ICONS[entity.type] || 'help'}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-300">{entity.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: TYPE_COLORS[entity.type] + '30', background: TYPE_COLORS[entity.type] + '10', color: TYPE_COLORS[entity.type] }}>{entity.type}</span>
                      </td>
                      <td className="px-5 py-3">
                        {conns > 0 ? (
                          <span className="text-xs font-mono text-[var(--accent)]">{conns}</span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {Object.keys(entity.metadata).length > 0
                            ? Object.entries(entity.metadata).slice(0, 2).map(([k, v]) => `${k}: ${String(v)}`).join(', ')
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Relationships */}
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-[var(--accent)]">lan</span>
            Relationships ({relationships.length})
          </h2>
          <div className="space-y-2">
            {relationships.map((rel, i) => {
              const src = entities.find(e => e.id === rel.source_id);
              const tgt = entities.find(e => e.id === rel.target_id);
              return (
                <div key={rel.id} className="glass-card px-4 py-3 flex items-center gap-3 text-sm stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono" style={{ background: (TYPE_COLORS[src?.type || ''] || '#6b7280') + '15', color: TYPE_COLORS[src?.type || ''] || '#6b7280' }}>{src?.type}</span>
                  <span className="text-gray-300 truncate max-w-[140px]">{src?.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/30"></div>
                    <div className="w-6 h-[1px] bg-[var(--accent)]/20"></div>
                    <span className="text-[9px] text-[var(--accent)] uppercase tracking-wider font-medium px-1.5 py-0.5 bg-[var(--accent)]/5 rounded">{rel.type}</span>
                    <div className="w-6 h-[1px] bg-[var(--accent)]/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/30"></div>
                  </div>
                  <span className="text-gray-300 truncate max-w-[140px]">{tgt?.name}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono" style={{ background: (TYPE_COLORS[tgt?.type || ''] || '#6b7280') + '15', color: TYPE_COLORS[tgt?.type || ''] || '#6b7280' }}>{tgt?.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
