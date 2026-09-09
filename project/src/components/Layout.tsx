import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const NAV = [
  { path: '', icon: 'folder', label: 'Overview' },
  { path: '/fir', icon: 'description', label: 'FIR Details' },
  { path: '/fir/register', icon: 'add_circle', label: 'Register FIR' },
  { path: '/entities', icon: 'hub', label: 'Entities' },
  { path: '/graph', icon: 'lan', label: 'Knowledge Graph' },
  { path: '/analytics', icon: 'analytics', label: 'Analytics' },
  { path: '/evidence', icon: 'folder_shared', label: 'Evidence' },
  { path: '/audit', icon: 'history', label: 'Audit Trail' },
  { path: '/report', icon: 'summarize', label: 'Report' },
];

export default function Layout({ caseId, children }: { caseId: string; children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const basePath = `/cases/${caseId}`;

  const isActive = (navPath: string) => {
    const fullPath = `${basePath}${navPath}`;
    if (navPath === '') return location.pathname === basePath;
    return location.pathname.startsWith(fullPath);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Open navigation menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6">
              <circle cx="24" cy="24" r="22" stroke="var(--accent)" strokeWidth="2" fill="var(--bg-primary)"/>
              <ellipse cx="24" cy="24" rx="14" ry="8" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
              <circle cx="24" cy="24" r="4" fill="var(--accent)"/>
              <circle cx="24" cy="24" r="1.5" fill="var(--bg-primary)"/>
            </svg>
            <span className="font-bold text-sm">Netra</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 flex flex-col z-50 transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
                  <circle cx="24" cy="24" r="22" stroke="var(--accent)" strokeWidth="2" fill="var(--bg-primary)"/>
                  <ellipse cx="24" cy="24" rx="14" ry="8" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                  <circle cx="24" cy="24" r="4" fill="var(--accent)"/>
                  <circle cx="24" cy="24" r="1.5" fill="var(--bg-primary)"/>
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 animate-pulse" style={{ borderColor: 'var(--bg-secondary)' }}></div>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">Netra</span>
                <p className="text-[9px] tracking-[3px] uppercase -mt-0.5" style={{ color: 'color-mix(in srgb, var(--accent) 60%, transparent)' }}>Intelligence Core</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} aria-label="Close navigation menu">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="material-symbols-outlined text-[18px] transition-colors group-hover:text-[var(--accent)]">dashboard</span>
            Dashboard
          </Link>

          <div className="pt-5 pb-2 px-3">
            <span className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-muted)' }}>Case Navigation</span>
          </div>

          {NAV.map(n => {
            const active = isActive(n.path);
            return (
              <Link
                key={n.path}
                to={`${basePath}${n.path}`}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                style={{
                  background: active ? 'var(--accent-muted)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: 'var(--accent)' }}></div>
                )}
                <span className="material-symbols-outlined text-[18px] transition-colors">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-card)' }}>
              <span className="material-symbols-outlined text-[18px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </div>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Settings */}
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-card)' }}>
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </div>
            Settings
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: 'var(--accent-muted)', borderColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--accent)' }}>person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] truncate capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role} — {user?.department}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-lg transition-colors group" title="Sign Out">
              <span className="material-symbols-outlined text-[16px] transition-colors" style={{ color: 'var(--text-muted)' }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

export { NAV };
