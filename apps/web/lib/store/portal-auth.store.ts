'use client';

import { create } from 'zustand';

interface PortalAuthState {
  token: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    companyId: string;
  } | null;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: PortalAuthState['user']) => void;
  login: (
    token: string,
    refreshToken: string,
    user: PortalAuthState['user']
  ) => void;
  logout: () => void;
}

export const usePortalAuthStore = create<PortalAuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setToken: (token) => set({ token, isAuthenticated: !!token }),

  setRefreshToken: (refreshToken) => set({ refreshToken }),

  setUser: (user) => set({ user }),

  login: (token, refreshToken, user) =>
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));
