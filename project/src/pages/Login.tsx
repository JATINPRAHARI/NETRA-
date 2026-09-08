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
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    navigate('/dashboard');
  };

  const handleDemo = () => {
    demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0d141d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg viewBox="0 0 48 48" fill="none" className="w-16 h-16 mb-4">
            <circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/>
            <ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/>
            <circle cx="24" cy="24" r="4" fill="#4cd7f6"/>
            <circle cx="24" cy="24" r="1.5" fill="#0d141d"/>
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-tight">Netra</h1>
          <p className="text-xs text-[#4cd7f6] tracking-[3px] uppercase mt-1">Intelligence Core</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Secure Access</h2>
          <p className="text-sm text-gray-400 mb-6">Authenticate to enter the intelligence network.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0d141d] border border-[#2a3a4a] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4cd7f6] transition-colors"
                placeholder="officer@netra.gov.in"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0d141d] border border-[#2a3a4a] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4cd7f6] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-[#4cd7f6] hover:bg-[#3bc4e3] text-[#0d141d] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Initialize Session'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[#2a3a4a]"></div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#2a3a4a]"></div>
          </div>

          <button
            onClick={handleDemo}
            className="w-full bg-[#2a3a4a] hover:bg-[#3a4a5a] text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#3a4a5a]"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            Demo Access
          </button>

          <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-wider">
            Prototype — Karnataka FIR Dataset — 1 Record
          </p>
        </div>
      </div>
    </div>
  );
}
