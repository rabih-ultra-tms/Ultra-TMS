import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
}

export interface PortalAuthState {
  token: string | null;
  user: PortalUser | null;
  companyId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: PortalUser) => void;
  clearAuth: () => void;
  setToken: (token: string) => void;
}

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      companyId: null,
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({
          token,
          user,
          companyId: user.companyId,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          token: null,
          user: null,
          companyId: null,
          isAuthenticated: false,
        }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'portal-auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
