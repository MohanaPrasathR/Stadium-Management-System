'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export function LoginModal() {
  const router = useRouter();
  const { showLoginModal, setShowLoginModal, login, demo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email, password } : { name, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Authentication failed. Please try again.');
      login(data);
      router.push(data.role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-card-border p-6 sm:p-8 rounded-2xl w-full max-w-md relative shadow-glass">

        {/* Close */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-black mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-text-muted mb-6 text-sm">
          {isLogin ? 'Sign in to access your account.' : 'Join to start booking stadium events.'}
        </p>

        {/* ── Error ── */}
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg font-bold">
            {error}
          </div>
        )}

        {/* ── Email / Password Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                className="input-field w-full mt-1"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              className="input-field w-full mt-1"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="input-field w-full mt-1"
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : 8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 mt-2 text-base text-center font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing…
              </>
            ) : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* ── Toggle ── */}
        <div className="mt-6 text-center text-sm text-text-muted">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* ── Demo Accounts (only in demo mode, no database configured) ── */}
        {demo && (
          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-text-muted space-y-1">
            <div className="font-bold text-white/40 uppercase tracking-wider mb-1">Demo accounts (data resets on restart)</div>
            <div>👤 Fan: <span className="text-white/70">fan@arenapass.demo / Arena@2026</span></div>
            <div>🔑 Admin: <span className="text-white/70">admin@arenapass.demo / Arena@2026</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
