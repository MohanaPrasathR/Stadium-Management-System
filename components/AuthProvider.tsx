'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type User = { id: number; name: string; email: string; role: 'user' | 'admin' } | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  demo: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  demo: false,
  login: () => {},
  logout: async () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
});

/**
 * The session lives in an HttpOnly cookie that JavaScript can't read or forge.
 * On load we ask the server who we are; nothing about the user is stored in localStorage.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { setUser(d.user); setDemo(!!d.demo); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    if (new URLSearchParams(window.location.search).get('login') === '1') setShowLoginModal(true);
  }, []);

  const login = useCallback((u: User) => { setUser(u); setShowLoginModal(false); }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, demo, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
