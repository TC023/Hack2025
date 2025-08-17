import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface User {
  id: string | number;
  name: string;
  last_name?: string;
  email: string;
  grade?: string;
  language?: string;
  token?: string; // JWT or session token
  [extra: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated login: ignores credentials and sets dummy profile data
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    // small artificial delay to show spinner
    await new Promise(r => setTimeout(r, 600));
    const dummyUser: User = {
      id: 'demo-1',
      name: 'Alonso',
      last_name: 'Lopez',
      email: email || 'alonso@example.com',
      grade: '5to',
      language: 'ES',
      token: 'fake-token-123',
      role: 'tester',
    };
    setUser(dummyUser);
    setLoading(false);
    return true;
  }, []);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
