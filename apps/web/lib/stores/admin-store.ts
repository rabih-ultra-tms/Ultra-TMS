import { createStore } from './create-store';
import { UserStatus } from '@/lib/types/auth';

interface UserFilters {
  search: string;
  status: UserStatus | '';
  roleId: string;
}

interface AdminState {
  userFilters: UserFilters;
  selectedUserId: string | null;
  isRoleDialogOpen: boolean;
  
  setUserFilter: <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => void;
  resetUserFilters: () => void;
  setSelectedUser: (id: string | null) => void;
  setRoleDialogOpen: (open: boolean) => void;
}

const defaultUserFilters: UserFilters = {
  search: '',
  status: '',
  roleId: '',
};

export const useAdminStore = createStore<AdminState>('admin-store', (set, get) => ({
  userFilters: defaultUserFilters,
  selectedUserId: null,
  isRoleDialogOpen: false,
  
  setUserFilter: (key, value) =>
    set({ userFilters: { ...get().userFilters, [key]: value } }),
  
  resetUserFilters: () => set({ userFilters: defaultUserFilters }),
  
  setSelectedUser: (id) => set({ selectedUserId: id }),
  
  setRoleDialogOpen: (open) => set({ isRoleDialogOpen: open }),
}));
