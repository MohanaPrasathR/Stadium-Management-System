'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Find User in Supabase
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (fetchError || !data || data.password !== password) {
        // Note: For production, password should be hashed, skipping for demo format.
        setError('Invalid email or password.');
      } else {
        login({ name: data.name, email: data.email, role: data.role, id: data.id });
      }
    } else {
      // Check if email exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        setError('Email already exists.');
        return;
      }
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ name, email, role: 'user', password }]) // Note: storing password plaintext just for demo!
        .select()
        .single();
        
      if (insertError) {
        setError('Error creating account.');
      } else {
        login({ name: newUser.name, email: newUser.email, role: 'user', id: newUser.id });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-card-border p-8 rounded-2xl w-full max-w-md relative shadow-glass">
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-text-muted mb-8 text-sm">
          {isLogin ? 'Enter your credentials to access your account.' : 'Join to start booking stadium events.'}
        </p>

        {error && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg font-bold">{error}</div>}
        
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

          <button type="submit" className="w-full btn-primary py-3 mt-4 text-lg text-center">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* Demo Accounts Notice */}
        <div className="mt-8 pt-4 border-t border-white/5 text-xs text-text-muted">
          <div className="font-bold mb-1">Demo Accounts:</div>
          <div>Admin: admin@stadiumhub.com / password123</div>
          <div>User: user@stadiumhub.com / password123</div>
        </div>

      </div>
    </div>
  );
}
