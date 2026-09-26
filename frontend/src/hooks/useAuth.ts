import { useCallback, useEffect, useState } from 'react';

export interface AuthUser {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  profilePictureUrl: string | null;
}

export const AUTH_CHANGE_EVENT = 'mmdb:auth-change';
export const SESSION_EXPIRED_EVENT = 'mmdb:session-expired';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function getStoredToken(): string | null {
  return (
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken')
  );
}

export function clearAuthState(): void {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function notifySessionExpired(): void {
  clearAuthState();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 && token) {
    notifySessionExpired();
  }
  return response;
}

function readAuth(): { user: AuthUser | null } {
  const token = getStoredToken();
  if (!token) return { user: null };
  try {
    const raw = localStorage.getItem('user');
    return { user: raw ? (JSON.parse(raw) as AuthUser) : null };
  } catch {
    return { user: null };
  }
}

export function useAuth() {
  const [auth, setAuth] = useState(readAuth);

  useEffect(() => {
    const refresh = () => setAuth(readAuth());
    window.addEventListener('storage', refresh);
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
    };
  }, []);

  const logout = useCallback(async () => {
    const token = getStoredToken();
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Network failure: local state is still cleared below.
    } finally {
      clearAuthState();
    }
  }, []);

  return { user: auth.user, isLoggedIn: auth.user !== null, logout };
}
