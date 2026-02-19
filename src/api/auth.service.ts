import { api } from './axios';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  MessageResponse,
  User,
} from '../types';

// ─────────────────────────────────────────────
//  STORAGE KEYS  (single source of truth)
// ─────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ─────────────────────────────────────────────
//  PERSISTENCE HELPERS
// ─────────────────────────────────────────────

function persistSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function persistUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────

/**
 * POST /api/login
 * Returns the token + full User object and persists them to localStorage.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/login', payload);
  persistSession(data.token, data.user);
  return data;
}

/**
 * POST /api/register
 * Creates a new user account, then auto-logs in (token is returned immediately).
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/register', payload);
  persistSession(data.token, data.user);
  return data;
}

/**
 * GET /api/me
 * Returns the currently authenticated user (Bearer token required).
 * Also refreshes the cached user in localStorage.
 */
export async function me(): Promise<User> {
  const { data } = await api.get<User>('/api/me');
  persistUser(data);
  return data;
}

/**
 * POST /api/logout
 * Revokes the Passport token on the server, then clears local storage.
 */
export async function logout(): Promise<void> {
  try {
    await api.post<MessageResponse>('/api/logout');
  } finally {
    // Always clear the local session, even if the server call fails
    clearSession();
  }
}

// ─────────────────────────────────────────────
//  SESSION READERS  (no async required)
// ─────────────────────────────────────────────

/** Returns the raw Bearer token stored in localStorage, or null. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Returns the cached User object from localStorage, or null. */
export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** True if a token currently exists in localStorage. */
export function isAuthenticated(): boolean {
  return Boolean(getToken());
}