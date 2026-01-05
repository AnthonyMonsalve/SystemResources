import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import type { AuthResponse, UserProfile } from '../types/auth';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'sr_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    void fetchProfile(token);
  }, [token]);

  const fetchProfile = async (authToken: string) => {
    try {
      const profile = await apiFetch<UserProfile>('/auth/profile', { token: authToken });
      setUser(profile);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const persistSession = (data: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      persistSession(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name?: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      persistSession(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
