import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { urls } from '../constants/urls';

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

  const login = useCallback(async (email: string, password: string) => {
    if (!urls.dbServer) {
      setError('Backend URL not configured');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(urls.dbServer.replace(/\/$/, '') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Invalid credentials');
      }
      const data = await res.json();
      // Expect user info + token. Adjust keys as backend dictates.
      setUser(data.user || data);
      setLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Login failed');
      setLoading(false);
      return false;
    }
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
