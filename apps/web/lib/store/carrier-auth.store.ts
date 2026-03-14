'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CarrierAuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    carrierId: string;
  } | null;
  carrierId: string | null;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string) => void;
  setAuth: (
    token: string,
    user: CarrierAuthState['user'],
    carrierId: string
  ) => void;
  clearAuth: () => void;
}

export const useCarrierAuthStore = create<CarrierAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      carrierId: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: !!token }),

      setAuth: (token, user, carrierId) =>
        set({
          token,
          user,
          carrierId,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          user: null,
          carrierId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'carrier-auth',
    }
  )
);
