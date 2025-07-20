import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  user_id: string;
  name: string;
  email: string;
  profile: 'admin' | 'master' | 'normal';
  unit_id?: string;
  unit_name?: string;
  has_agenda?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);