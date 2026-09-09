import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { signIn, demoLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = () => {
    demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4cd7f6]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#4cd7f6]/3 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        {/* Orbital rings */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04]" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="200" stroke="#4cd7f6" strokeWidth="0.5" fill="none" strokeDasharray="4 8">
            <animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="60s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="300" r="260" stroke="#4cd7f6" strokeWidth="0.3" fill="none" strokeDasharray="2 12">
            <animateTransform attributeName="transform" type="rotate" from="360 300 300" to="0 300 300" dur="90s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="300" r="150" stroke="#4cd7f6" strokeWidth="0.3" fill="none" strokeDasharray="6 6">
            <animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="45s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <svg viewBox="0 0 48 48" fill="none" className="w-20 h-20 drop-shadow-[0_0_30px_rgba(76,215,246,0.3)]">
              <circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="1.5" fill="#0a0f18"/>
              <ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1" fill="none"/>
              <circle cx="24" cy="24" r="4" fill="#4cd7f6"/>
              <circle cx="24" cy="24" r="1.5" fill="#0a0f18"/>
              <circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="0.3" fill="none" strokeDasharray="2 6">
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="20s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Netra</h1>
          <p className="text-xs tracking-[4px] uppercase mt-1.5 font-medium" style={{ color: 'color-mix(in srgb, var(--accent) 70%, transparent)' }}>Intelligence Core</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 shadow-2xl shadow-black/20">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Secure Access</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Authenticate to enter the intelligence network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="login-email" className="block text-xs mb-1.5 uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative rounded-xl transition-all duration-300 focus-within:ring-1 focus-within:ring-[#4cd7f6]/30">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px]" style={{ color: 'var(--text-muted)' }}>mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="officer@netra.gov.in"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="login-password" className="block text-xs mb-1.5 uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative rounded-xl transition-all duration-300 focus-within:ring-1 focus-within:ring-[#4cd7f6]/30">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px]" style={{ color: 'var(--text-muted)' }}>lock</span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3 animate-fade-in">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span className="text-xs">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-gradient-to-r from-[#4cd7f6] to-[#3bc4e3] hover:from-[#3bc4e3] hover:to-[#4cd7f6] text-[#0a0f18] font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4cd7f6]/10 hover:shadow-[#4cd7f6]/20 active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0a0f18]/30 border-t-[#0a0f18] rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : 'Initialize Session'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}></div>
            <span className="text-[9px] uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}></div>
          </div>

          <button
            onClick={handleDemo}
            className="w-full font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 border active:scale-[0.98]"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--accent)' }}>play_circle</span>
            Demo Access
          </button>

          <p className="text-center text-[9px] mt-5 uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>
            Criminal Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  );
}
