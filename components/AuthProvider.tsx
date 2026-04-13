'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type User = { name: string; email: string; role: 'user' | 'admin' } | null;

interface AuthContextType {
  user: User;
  login: (user: User) => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem('stadium_auth_session');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('stadium_auth_session', JSON.stringify(newUser));
    setShowLoginModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stadium_auth_session');
    window.location.href = '/';
  };

  if (!mounted) return <>{children}</>;

  return (
    <AuthContext.Provider value={{ user, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
