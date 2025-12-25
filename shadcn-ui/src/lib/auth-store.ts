import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  phone?: string;
  address?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
}

// Mock users for demonstration
const mockUsers = [
  {
    id: 'admin-1',
    email: 'admin@dakarshop.sn',
    password: 'admin123',
    name: 'Administrateur',
    role: 'admin' as const,
  },
  {
    id: 'client-1',
    email: 'client@example.com',
    password: 'client123',
    name: 'Client Test',
    role: 'client' as const,
    phone: '+221 77 123 45 67',
    address: 'Dakar, Plateau',
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }

        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: async (email: string, password: string, name: string, phone: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if user already exists
        const existingUser = mockUsers.find((u) => u.email === email);
        if (existingUser) {
          return false;
        }

        const newUser: User = {
          id: `client-${Date.now()}`,
          email,
          name,
          phone,
          role: 'client',
        };

        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);