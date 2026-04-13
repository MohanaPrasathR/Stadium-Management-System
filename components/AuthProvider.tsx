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
    
    // Check for logged in session
    const storedSession = localStorage.getItem('stadium_auth_session');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }

    // Initialize mock database if empty
    const dbUsers = localStorage.getItem('stadium_users_db');
    if (!dbUsers) {
      const initialUsers = [
        { name: 'Admin User', email: 'admin@stadiumhub.com', password: 'password123', role: 'admin' },
        { name: 'John Doe', email: 'user@stadiumhub.com', password: 'password123', role: 'user' }
      ];
      localStorage.setItem('stadium_users_db', JSON.stringify(initialUsers));
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
