// src/context/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import {
  getToken,
  getStoredUser,
  isAuthenticated as checkAuth,
} from '../api/auth.service';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setToken = useCallback((token: string | null) => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, [setToken]);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = getToken();
      const cachedUser = getStoredUser();

      if (token && cachedUser) {
        setUser(cachedUser as User);
        setIsAuthenticated(true);
      } else {
        const ok = checkAuth();
        setIsAuthenticated(ok);
        if (!ok) setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:unauthenticated', handler);
    return () => window.removeEventListener('auth:unauthenticated', handler);
  }, [logout]);

  // ✅ DEV LOGIN (temporal): deja entrar a /app sin backend
  const login = useCallback(
    async (email: string, password: string) => {
      const e = email.trim();
      const p = password.trim();

      if (!e || !p) throw new Error('Email and password are required');

      setToken('dev-token');
      setIsAuthenticated(true);

      // Usuario mínimo. Lo casteamos sin @ts-expect-error para evitar warnings.
      const devUser = { id: 1, name: e, email: e };
      setUser(devUser as unknown as User);
    },
    [setToken],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      setToken,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, setToken, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
