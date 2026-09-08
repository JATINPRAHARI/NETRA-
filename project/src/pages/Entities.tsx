import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const TYPE_COLORS: Record<string, string> = {
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

  const grouped = entities.reduce((acc, e) => {
    (acc[e.type] = acc[e.type] || []).push(e);
    return acc;
  }, {} as Record<string, typeof entities>);

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
        <h1 className="text-2xl font-extrabold tracking-tight">Entities</h1>
        <p className="text-sm text-gray-400">{entities.length} entities extracted from FIR data</p>
      </header>

      <div className="p-6 space-y-8 animate-fade-in">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([type, items], i) => (
            <div key={type} className="stat-card stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${TYPE_COLORS[type]?.split(' ')[1] || 'text-gray-400'}`}>{TYPE_ICONS[type] || 'help'}</span>
                <div>
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Entity Cards */}
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined text-[14px] ${TYPE_COLORS[type]?.split(' ')[1]}`}>{TYPE_ICONS[type]}</span>
              {type} ({items.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((entity, i) => (
                <div key={entity.id} className="glass-card-hover p-4 stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${TYPE_COLORS[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        <span className="material-symbols-outlined text-[16px]">{TYPE_ICONS[type] || 'help'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entity.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{entity.id}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${TYPE_COLORS[type] || ''}`}>{type}</span>
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
              ))}
            </div>
          </div>
        ))}

        {/* Relationships */}
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">lan</span>
            Relationships ({relationships.length})
          </h2>
          <div className="space-y-2">
            {relationships.map((rel, i) => {
              const src = entities.find(e => e.id === rel.source_id);
              const tgt = entities.find(e => e.id === rel.target_id);
              return (
                <div key={rel.id} className="glass-card px-4 py-3 flex items-center gap-3 text-sm stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                  <span className="px-2 py-0.5 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded-lg text-xs font-mono">{src?.type}</span>
                  <span className="text-gray-300 truncate max-w-[140px]">{src?.name}</span>
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]">arrow_forward</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">{rel.type}</span>
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]">arrow_forward</span>
                  <span className="text-gray-300 truncate max-w-[140px]">{tgt?.name}</span>
                  <span className="px-2 py-0.5 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded-lg text-xs font-mono">{tgt?.type}</span>
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
