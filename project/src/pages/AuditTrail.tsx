import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const ACTION_COLORS: Record<string, string> = {
  'CASE_CREATED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'FIR_IMPORTED': 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20',
  'ENTITIES_EXTRACTED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'RELATIONSHIPS_CREATED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'ANALYSIS_STARTED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'ANALYSIS_COMPLETED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'RISK_CALCULATED': 'bg-red-500/10 text-red-400 border-red-500/20',
  'EVIDENCE_UPLOADED': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'EVIDENCE_VERIFIED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'REPORT_GENERATED': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function AuditTrail() {
  const { caseData, auditLogs, loading } = useCaseData();

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading audit trail...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Audit Trail</h1>
          <p className="text-xs text-gray-500">{auditLogs.length} events — append-only immutable log</p>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg uppercase tracking-wider font-medium">
          Immutable
        </span>
      </header>

      <div className="p-6 animate-fade-in">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Timestamp</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Action</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">User</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Resource</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {auditLogs.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${ACTION_COLORS[log.action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-300">{log.user_name || log.user_id}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{log.resource_id}</td>
                    <td className="px-5 py-3 font-mono text-[10px] text-gray-500 max-w-[200px] truncate">{log.hash || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 glass-card p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-amber-400 text-[16px]">lock</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Append-Only Audit Log</p>
            <p className="text-xs text-gray-500">All actions are recorded with SHA-256 hashes. Records cannot be edited or deleted.</p>
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
