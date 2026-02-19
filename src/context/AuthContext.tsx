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
      // USAMOS getToken() para evitar el "imported but never used"
      const token = getToken();
      const cachedUser = getStoredUser();

      if (token && cachedUser) {
        setUser(cachedUser as User);
        setIsAuthenticated(true);
      } else {
        // Fallback: si hay token pero no user cacheado
        // (cuando tengas endpoint /me, aquí sería el sitio para pedirlo)
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

  const login = useCallback(
    async (_email: string, _password: string) => {
      // TODO: conectar con auth.service.ts cuando tengamos el endpoint real de login
      // Aquí dejamos el contrato listo para que LoginPage llame useAuth().login()
      throw new Error('login() not implemented yet');
    },
    [],
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
