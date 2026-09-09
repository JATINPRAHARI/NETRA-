import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';

type UserRecord = { name: string; role: string; lastActive: string };

const USERS: UserRecord[] = [
  { name: 'Officer R. Malhotra', role: 'INVESTIGATOR', lastActive: '2026-08-27 09:12' },
  { name: 'Officer P. Iyer', role: 'INVESTIGATOR', lastActive: '2026-08-26 18:40' },
  { name: 'Supervisor A. Bose', role: 'SUPERVISOR', lastActive: '2026-08-26 20:05' },
  { name: 'Admin K. Rao', role: 'ADMIN', lastActive: '2026-08-25 11:00' },
];

const ROLE_COLORS: Record<string, string> = {
  INVESTIGATOR: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SUPERVISOR: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  ADMIN: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ['Manage users', 'Manage datasets', 'System monitoring'],
  Investigator: ['Analyze cases', 'Upload data', 'Query networks', 'Generate reports'],
  Supervisor: ['Review investigations', 'Review reports', 'Monitor activity'],
};

export default function AdminRoles() {
  const { caseData } = useAuth();

  return (
    <Layout caseId={caseData.id}>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin & Roles</h1>
          <p className="text-xs text-gray-500">Role-based access control. Demo mode — no real auth enforcement.</p>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04]">
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Users</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {USERS.map((u, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="px-5 py-3 text-xs font-medium text-gray-300">{u.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions */}
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Role Permissions</h2>
            <div className="space-y-5">
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <div key={role}>
                  <h3 className="text-sm font-bold mb-2">{role}</h3>
                  <div className="space-y-1.5">
                    {perms.map((p, pi) => (
                      <div key={pi} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-[var(--accent)]">+</span> {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
