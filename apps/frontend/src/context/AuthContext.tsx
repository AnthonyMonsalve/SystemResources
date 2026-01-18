import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, clearTokenCookie, readTokenCookie, setTokenCookie } from "../lib/api";
import type { AuthResponse, UserProfile } from "../types/auth";

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  initializing: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = "portal-user-profile";

function readStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function writeStoredUser(user: UserProfile | null) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readTokenCookie());
  const [user, setUser] = useState<UserProfile | null>(() => readStoredUser());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() => {
    const hasToken = !!readTokenCookie();
    const hasUser = !!readStoredUser();
    return hasToken && !hasUser;
  });
  const lastValidatedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      writeStoredUser(null);
      setInitializing(false);
      lastValidatedToken.current = null;
      return;
    }
    if (lastValidatedToken.current === token) {
      setInitializing(false);
      return;
    }
    setInitializing(!user);
    lastValidatedToken.current = token;
    void fetchProfile(token).finally(() => setInitializing(false));
  }, [token, user]);

  const fetchProfile = async (authToken: string) => {
    try {
      const profile = await apiFetch<UserProfile>("/auth/profile", { token: authToken });
      setUser(profile);
      writeStoredUser(profile);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const persistSession = (data: AuthResponse) => {
    setTokenCookie(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    writeStoredUser(data.user);
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
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
      const data = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      persistSession(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokenCookie();
    setToken(null);
    setUser(null);
    writeStoredUser(null);
  };

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout, loading }),
    [user, token, initializing, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
