import { createStore } from './create-store';
import { User } from '@/lib/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  
  // Helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
}

export const useAuthStore = createStore<AuthState>('auth-store', (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false,
  }),
  
  hasPermission: (permission) => {
    const { user } = get();
    return user?.permissions?.includes(permission) ?? false;
  },
  
  hasRole: (roleName) => {
    const { user } = get();
    return user?.roles?.some(r => r.name === roleName) ?? false;
  },
  
  hasAnyRole: (roleNames) => {
    const { user } = get();
    return user?.roles?.some(r => roleNames.includes(r.name)) ?? false;
  },
}));
