import { create } from 'zustand';
import type { User } from '@shared/types';
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null });
  },
}));