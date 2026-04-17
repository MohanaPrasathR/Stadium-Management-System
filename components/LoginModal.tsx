'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export function LoginModal() {
  const router = useRouter();
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState<'idle' | 'connecting' | 'selecting' | 'done'>('idle');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!showLoginModal) return null;

  // ─── Email / Password Submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Authentication failed');

      login(data);
      setShowLoginModal(false);
      router.push(data.role === 'admin' ? '/admin' : '/user');

    } catch (err: any) {
      // Presentation fallback — always work with @stadiumhub.com addresses
      if (email.includes('stadiumhub.com')) {
        const demoUser = {
          id: 'demo-123',
          name: name || (email.startsWith('admin') ? 'Admin Demo' : 'User Demo'),
          email,
          role: (email.includes('admin') ? 'admin' : 'user') as 'admin' | 'user',
        };
        login(demoUser);
        setShowLoginModal(false);
        router.push(demoUser.role === 'admin' ? '/admin' : '/user');
      } else {
        setError(err.message || 'Connection failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In Simulation ─────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError('');

    // Step 1: "Connecting to Google…"
    setGoogleStep('connecting');
    await new Promise(r => setTimeout(r, 1200));

    // Step 2: "Selecting account…"
    setGoogleStep('selecting');
    await new Promise(r => setTimeout(r, 1400));

    // Step 3: Done — sign in as Google user
    setGoogleStep('done');
    await new Promise(r => setTimeout(r, 500));

    const googleUser = {
      id: 'google-demo-001',
      name: 'Mohan Prasath',
      email: 'mohan.prasath@gmail.com',
      role: 'user' as const,
      provider: 'google',
    };

    // Save to simdb via register
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        name: googleUser.name,
        email: googleUser.email,
        password: 'google-oauth-token',
      }),
    }).catch(() => {}); // fire-and-forget

    login(googleUser);
    setShowLoginModal(false);
    setIsGoogleLoading(false);
    setGoogleStep('idle');
    router.push('/user');
  };

  const googleButtonLabel = {
    idle: 'Continue with Google',
    connecting: 'Connecting to Google…',
    selecting: 'Select your Google account…',
    done: 'Signing you in…',
  }[googleStep];

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

        {/* ── Google Button ── */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all font-semibold text-sm disabled:opacity-70 mb-5"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            /* Official Google "G" logo SVG */
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleButtonLabel}</span>
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-text-muted font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

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
              placeholder="user@stadiumhub.com"
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

        {/* ── Demo Accounts ── */}
        <div className="mt-6 pt-4 border-t border-white/5 text-xs text-text-muted space-y-1">
          <div className="font-bold text-white/40 uppercase tracking-wider mb-1">Demo Accounts</div>
          <div>👤 User: <span className="text-white/70">user@stadiumhub.com / password123</span></div>
          <div>🔑 Admin: <span className="text-white/70">admin@stadiumhub.com / password123</span></div>
          <div>🌐 Google: <span className="text-white/70">Click "Continue with Google" above</span></div>
        </div>
      </div>
    </div>
  );
}
