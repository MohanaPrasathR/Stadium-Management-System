'use client';
import { useAuth } from './AuthProvider';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();

  if (!showLoginModal) return null;

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
        <h2 className="text-3xl font-black mb-2">Login Required</h2>
        <p className="text-text-muted mb-8 text-sm">Please select your account type to access this feature.</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => login('user')}
            className="w-full btn-primary py-4 text-lg text-center"
          >
            Login as Guest / User
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-xs font-bold uppercase">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={() => login('admin')}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all text-center"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
