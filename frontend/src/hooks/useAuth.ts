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

function readAuth(): { user: AuthUser | null } {
  const token =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');
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

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  return { user: auth.user, isLoggedIn: auth.user !== null, logout };
}
