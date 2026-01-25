'use client';

import { create } from 'zustand';

import { getAccessToken } from '@/shared/lib/authToken';

export type UserRole =
  | 'DISTRICT_OFFICE'
  | 'CITY_HALL'
  | 'ARCHITECT_SOCIETY'
  | 'INSPECTOR';

const AUTH_USER_KEY = 'supervision/auth-user';

const KNOWN_ROLES: readonly UserRole[] = [
  'DISTRICT_OFFICE',
  'CITY_HALL',
  'ARCHITECT_SOCIETY',
  'INSPECTOR',
];

const ROLE_ALIASES: Record<string, UserRole> = {
  ARCHITECTURE_SOCIETY: 'ARCHITECT_SOCIETY',
  ARCHITECTS_SOCIETY: 'ARCHITECT_SOCIETY',
  ARCHITECTS_ASSOC: 'ARCHITECT_SOCIETY',
  ARCHITECTURE_ASSOCIATION: 'ARCHITECT_SOCIETY',
};

function normalizeRole(rawRole?: string | null): UserRole | null {
  if (!rawRole) {
    return null;
  }
  const aliasMatched = ROLE_ALIASES[rawRole];
  if (aliasMatched) {
    return aliasMatched;
  }
  if (KNOWN_ROLES.includes(rawRole as UserRole)) {
    return rawRole as UserRole;
  }
  return null;
}

interface AuthState {
  token: string | null;
  username: string | null;
  role: UserRole | null;
  email: string | null;
  region: string | null;
  zone: string | null;
  setCredentials: (payload: {
    token: string;
    username: string;
    role: string;
    email?: string | null;
    region?: string | null;
    zone?: string | null;
  }) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  role: null,
  email: null,
  region: null,
  zone: null,
  setCredentials: ({ token, username, role, email = null, region = null, zone = null }) => {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole && role) {
      console.warn('Unknown user role received:', role);
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({ username, role: normalizedRole, email, region, zone }),
      );
    }
    set({ token, username, role: normalizedRole, email, region, zone });
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
    set({ token: null, username: null, role: null, email: null, region: null, zone: null });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = getAccessToken();
    const stored = sessionStorage.getItem(AUTH_USER_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as {
        username: string;
        role?: string | null;
        email?: string | null;
        region?: string | null;
        zone?: string | null;
      };
      const normalizedRole = normalizeRole(parsed.role);
      if (!normalizedRole && parsed.role) {
        console.warn('Unknown stored user role detected:', parsed.role);
      }
      set({
        token: token ?? null,
        username: parsed.username,
        role: normalizedRole,
        email: parsed.email ?? null,
        region: parsed.region ?? null,
        zone: parsed.zone ?? null,
      });
    } catch (error) {
      console.error('Failed to parse auth storage', error);
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
  },
}));
