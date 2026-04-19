import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin' | 'superadmin';
  phone?: string | null;
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeUser(u: any): User | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name || u.fullName || '',
    role: u.role,
    phone: u.phone ?? null,
    createdAt: u.createdAt ?? null,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (emailOrPhone, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ emailOrPhone, password }),
          });

          const data = await safeJson(res);

          if (!res.ok || !data?.ok || !data?.user) {
            return { ok: false, error: data?.error || 'Identifiants incorrects' };
          }

          set({ user: normalizeUser(data.user), isAuthenticated: true });
          return { ok: true };
        } catch {
          return { ok: false, error: 'Erreur réseau' };
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // ignore
        }
        set({ user: null, isAuthenticated: false });
      },

      register: async ({ fullName, email, phone, password }) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fullName, email, phone, password }),
          });

          const data = await safeJson(res);

          if (!res.ok || !data?.ok || !data?.user) {
            return { ok: false, error: data?.error || 'Erreur lors de l\'inscription' };
          }

          set({ user: normalizeUser(data.user), isAuthenticated: true });
          return { ok: true };
        } catch {
          return { ok: false, error: 'Erreur réseau' };
        }
      },

      updateProfile: (data) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...data } });
      },

      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          const data = await safeJson(res);
          if (data?.ok && data?.user) {
            set({ user: normalizeUser(data.user), isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'samani-auth-v3',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export function isAdmin(user: User | null) {
  return user?.role === 'admin' || user?.role === 'superadmin';
}
