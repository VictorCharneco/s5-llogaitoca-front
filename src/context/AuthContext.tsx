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
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  me as apiMe,
} from '../api/auth.service';

import type { RegisterPayload, User } from '../types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mantengo esto por compatibilidad: el interceptor de axios lee auth_token
  const setToken = useCallback((token: string | null) => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      // apiLogout ya limpia storage, pero mantenemos estado React consistente
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [setToken]);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = getToken();
      const cachedUser = getStoredUser();

      if (token && cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        return;
      }

      // Si hay token pero no hay user cacheado, intentamos /api/me
      if (token) {
        try {
          const me = await apiMe();
          setUser(me);
          setIsAuthenticated(true);
          return;
        } catch {
          // Token inválido/expirado o backend no responde: limpiamos estado
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
          return;
        }
      }

      // Sin token
      const ok = checkAuth();
      setIsAuthenticated(ok);
      if (!ok) setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handler = () => {
      // si axios interceptor dispara auth:unauthenticated, deslogueamos
      void logout();
    };
    window.addEventListener('auth:unauthenticated', handler);
    return () => window.removeEventListener('auth:unauthenticated', handler);
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const e = email.trim();
      const p = password.trim();
      if (!e || !p) throw new Error('Email and password are required');

      const { token, user } = await apiLogin({ email: e, password: p });

      // auth.service ya persiste token/user en storage, pero mantenemos el interceptor alineado
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
    },
    [setToken],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token, user } = await apiRegister(payload);

      // auth.service ya persiste token/user en storage, pero mantenemos el interceptor alineado
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
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
      register,
      logout,
    }),
    [user, isAuthenticated, isLoading, setToken, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}