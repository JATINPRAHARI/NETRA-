import { useParams, Link } from 'react-router-dom';
import { demoStore } from '@/lib/auth';

const ACTION_COLORS: Record<string, string> = {
  'case.created': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'fir.imported': 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20',
  'entity.extracted': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'relationship.created': 'bg-green-500/10 text-green-400 border-green-500/20',
  'analysis.run': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'risk.calculated': 'bg-red-500/10 text-red-400 border-red-500/20',
  'evidence.uploaded': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'report.generated': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function AuditTrail() {
  const { caseId } = useParams();
  const auditLogs = demoStore.getAuditLogs();

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
        <header className="border-b border-[#2a3a4a] px-6 py-4 sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Audit Trail</h1>
            <p className="text-xs text-gray-400">{auditLogs.length} events — append-only immutable log</p>
          </div>
          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
            Immutable
          </span>
        </header>

        <div className="p-6">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3a4a]">
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Timestamp</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Action</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">User</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Resource</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3a4a]/50">
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-[#2a3a4a]/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${ACTION_COLORS[log.action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
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

          <div className="mt-4 bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-400 text-[18px]">lock</span>
            <div>
              <p className="text-sm font-medium text-gray-300">Append-Only Audit Log</p>
              <p className="text-xs text-gray-500">All actions are recorded with SHA-256 hashes. Records cannot be edited or deleted.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
