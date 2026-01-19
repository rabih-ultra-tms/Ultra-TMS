# 01 - Auth & Admin UI Implementation

> **Service:** Authentication & Administration (Users, Roles, Permissions, Tenants)  
> **Priority:** P0 - Critical (Foundation)  
> **Pages:** 12  
> **API Endpoints:** 45  
> **Dependencies:** Foundation ✅, Auth API ✅  
> **Doc Reference:** [08-service-auth-admin.md](../../02-services/08-service-auth-admin.md)

---

## 📋 Overview

The Auth & Admin UI provides the authentication system and administrative interfaces for user management, role-based access control, tenant configuration, and system settings. This is a foundational service that all other services depend on.

### Key Screens
- Login / Registration
- Password reset / MFA setup
- User management dashboard
- Role & permission management
- Tenant administration
- System settings
- Audit log viewer
- User profile settings

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth API is deployed and accessible
- [ ] Environment variables configured (API_URL, AUTH endpoints)

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add input-otp
npx shadcn@latest add switch
npx shadcn@latest add separator
```

---

## 🗂️ Route Structure

```
app/
├── (auth)/
│   ├── layout.tsx                  # Auth layout (no sidebar)
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── register/
│   │   └── page.tsx                # Registration
│   ├── forgot-password/
│   │   └── page.tsx                # Password reset request
│   ├── reset-password/
│   │   └── page.tsx                # Password reset form
│   ├── verify-email/
│   │   └── page.tsx                # Email verification
│   └── mfa/
│       └── page.tsx                # MFA verification
├── (dashboard)/
│   ├── admin/
│   │   ├── users/
│   │   │   ├── page.tsx            # Users list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create user
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # User detail
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit user
│   │   ├── roles/
│   │   │   ├── page.tsx            # Roles list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create role
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Role detail/edit
│   │   ├── permissions/
│   │   │   └── page.tsx            # Permissions matrix
│   │   ├── tenants/
│   │   │   ├── page.tsx            # Tenants list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Tenant settings
│   │   ├── audit-logs/
│   │   │   └── page.tsx            # Audit log viewer
│   │   └── settings/
│   │       └── page.tsx            # System settings
│   └── profile/
│       ├── page.tsx                # User profile
│       └── security/
│           └── page.tsx            # Security settings (password, MFA)
```

---

## 🎨 Components to Create

```
components/auth/
├── login-form.tsx                  # Login form
├── register-form.tsx               # Registration form
├── forgot-password-form.tsx        # Password reset request
├── reset-password-form.tsx         # Password reset form
├── mfa-input.tsx                   # MFA code input
├── mfa-setup-dialog.tsx            # MFA setup wizard
├── social-login-buttons.tsx        # OAuth providers
└── auth-layout.tsx                 # Auth pages layout

components/admin/
├── users/
│   ├── users-table.tsx             # Users list table
│   ├── users-columns.tsx           # Column definitions
│   ├── user-form.tsx               # Create/edit user form
│   ├── user-detail-card.tsx        # User overview
│   ├── user-status-badge.tsx       # Status indicator
│   ├── user-roles-section.tsx      # Assigned roles
│   └── user-filters.tsx            # Filter controls
├── roles/
│   ├── roles-table.tsx             # Roles list
│   ├── role-form.tsx               # Create/edit role
│   ├── role-permissions-editor.tsx # Permission assignment
│   └── role-users-section.tsx      # Users with role
├── permissions/
│   ├── permissions-matrix.tsx      # Permission grid
│   └── permission-group-card.tsx   # Permission category
├── tenants/
│   ├── tenants-table.tsx           # Tenants list
│   ├── tenant-form.tsx             # Create/edit tenant
│   ├── tenant-settings-form.tsx    # Tenant configuration
│   └── tenant-users-section.tsx    # Tenant users
├── audit/
│   ├── audit-log-table.tsx         # Audit entries
│   ├── audit-log-filters.tsx       # Filter controls
│   └── audit-log-detail.tsx        # Entry details
└── settings/
    ├── general-settings-form.tsx   # System settings
    ├── security-settings-form.tsx  # Security config
    └── notification-settings.tsx   # Notification prefs

components/profile/
├── profile-form.tsx                # Profile edit form
├── avatar-upload.tsx               # Avatar management
├── password-change-form.tsx        # Change password
├── mfa-settings.tsx                # MFA configuration
└── active-sessions.tsx             # Session management
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/auth.ts`

```typescript
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'LOCKED';

export type MFAMethod = 'TOTP' | 'SMS' | 'EMAIL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  
  status: UserStatus;
  emailVerified: boolean;
  
  // MFA
  mfaEnabled: boolean;
  mfaMethod?: MFAMethod;
  
  // Tenant
  tenantId: string;
  tenantName?: string;
  
  // Roles
  roles: Role[];
  permissions: string[];
  
  // Metadata
  lastLoginAt?: string;
  passwordChangedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  
  permissions: Permission[];
  userCount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  group: string;
  isSystem: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  
  // Settings
  settings: TenantSettings;
  
  // Metrics
  userCount: number;
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  historyCount: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  
  userId: string;
  userEmail: string;
  userName: string;
  
  ipAddress?: string;
  userAgent?: string;
  
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
}

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface MFAVerifyRequest {
  code: string;
  mfaToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/auth/use-auth.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MFAVerifyRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  Session,
} from '@/lib/types/auth';
import { toast } from 'sonner';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiClient.get<{ data: User }>('/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post<LoginResponse>('/auth/login', data),
    onSuccess: (response) => {
      if (response.requiresMfa) {
        // Redirect to MFA verification
        router.push(`/mfa?token=${response.mfaToken}`);
      } else {
        // Store tokens and redirect
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        queryClient.setQueryData(authKeys.user(), { data: response.user });
        router.push('/dashboard');
        toast.success('Welcome back!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid credentials');
    },
  });
}

export function useVerifyMFA() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: MFAVerifyRequest) =>
      apiClient.post<LoginResponse>('/auth/mfa/verify', data),
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      queryClient.setQueryData(authKeys.user(), { data: response.user });
      router.push('/dashboard');
      toast.success('Welcome back!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid verification code');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient.post('/auth/register', data),
    onSuccess: () => {
      router.push('/login?registered=true');
      toast.success('Registration successful! Please check your email to verify your account.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      router.push('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Still clear local state even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) =>
      apiClient.post('/auth/forgot-password', data),
    onSuccess: () => {
      toast.success('If an account exists with that email, you will receive a password reset link.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: PasswordResetConfirm) =>
      apiClient.post('/auth/reset-password', data),
    onSuccess: () => {
      router.push('/login?reset=true');
      toast.success('Password reset successfully! Please login with your new password.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

export function useEnableMFA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (method: 'TOTP' | 'SMS' | 'EMAIL') =>
      apiClient.post<{ data: { secret: string; qrCode: string } }>('/auth/mfa/enable', { method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enable MFA');
    },
  });
}

export function useConfirmMFA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) =>
      apiClient.post('/auth/mfa/confirm', { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success('MFA enabled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid verification code');
    },
  });
}

export function useDisableMFA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password: string) =>
      apiClient.post('/auth/mfa/disable', { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success('MFA disabled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disable MFA');
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => apiClient.get<{ data: Session[] }>('/auth/sessions'),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success('Session revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.delete('/auth/sessions'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success('All other sessions revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke sessions');
    },
  });
}
```

### File: `lib/hooks/admin/use-users.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { User } from '@/lib/types/auth';
import { toast } from 'sonner';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<User>>('/admin/users', params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.get<{ data: User }>(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User> & { password?: string; sendInvite?: boolean }) =>
      apiClient.post<{ data: User }>('/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiClient.patch<{ data: User }>(`/admin/users/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      apiClient.put(`/admin/users/${userId}/roles`, { roleIds }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      toast.success('Roles updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update roles');
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post(`/admin/users/${userId}/reset-password`),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post(`/admin/users/${userId}/unlock`),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User unlocked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock user');
    },
  });
}
```

### File: `lib/hooks/admin/use-roles.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Role, Permission } from '@/lib/types/auth';
import { toast } from 'sonner';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => apiClient.get<{ data: Role[] }>('/admin/roles'),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Role }>(`/admin/roles/${id}`),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => apiClient.get<{ data: Permission[] }>('/admin/permissions'),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Role> & { permissionIds?: string[] }) =>
      apiClient.post<{ data: Role }>('/admin/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success('Role created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> & { permissionIds?: string[] } }) =>
      apiClient.patch<{ data: Role }>(`/admin/roles/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success('Role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success('Role deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/auth-store.ts`

```typescript
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
```

### File: `lib/stores/admin-store.ts`

```typescript
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
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/auth.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  inviteToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const mfaCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

export const userFormSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleIds: z.array(z.string()).min(1, 'At least one role is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  sendInvite: z.boolean().default(true),
});

export const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required').regex(/^[a-z_]+$/, 'Use lowercase letters and underscores only'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type MFACodeFormData = z.infer<typeof mfaCodeSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type RoleFormData = z.infer<typeof roleFormSchema>;
```

---

## 📄 Page Implementations

### File: `app/(auth)/login/page.tsx`

```typescript
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useLogin } from '@/lib/hooks/auth/use-auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const reset = searchParams.get('reset') === 'true';
  
  const { mutate: login, isPending } = useLogin();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        
        <CardContent>
          {registered && (
            <Alert className="mb-4">
              <AlertDescription>
                Registration successful! Please check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}
          
          {reset && (
            <Alert className="mb-4">
              <AlertDescription>
                Password reset successful! Please login with your new password.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### File: `app/(dashboard)/admin/users/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { UsersTable } from '@/components/admin/users/users-table';
import { UserFilters } from '@/components/admin/users/user-filters';
import { useUsers } from '@/lib/hooks/admin/use-users';
import { useAdminStore } from '@/lib/stores/admin-store';
import { useDebounce } from '@/lib/hooks';

export default function UsersPage() {
  const router = useRouter();
  const { userFilters } = useAdminStore();
  const debouncedSearch = useDebounce(userFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit: 20,
    search: debouncedSearch,
    status: userFilters.status || undefined,
    roleId: userFilters.roleId || undefined,
  });

  const handleCreate = () => router.push('/admin/users/new');
  const handleView = (id: string) => router.push(`/admin/users/${id}`);

  // Calculate stats
  const users = data?.data || [];
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const pendingCount = users.filter(u => u.status === 'PENDING').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users and their access"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
          </CardContent>
        </Card>
      </div>

      <UserFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading users..." />
      ) : error ? (
        <ErrorState
          title="Failed to load users"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : data?.data.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by adding your first user."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
      ) : (
        <UsersTable
          users={data?.data || []}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
```

---

## 🧪 Jest Tests

### File: `components/auth/login-form.test.tsx`

```typescript
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup();
    
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
    });
  });

  it('has link to forgot password', () => {
    render(<LoginPage />);

    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('has link to register', () => {
    render(<LoginPage />);

    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
  });
});
```

### File: `components/admin/users/users-table.test.tsx`

```typescript
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { UsersTable } from './users-table';
import { User } from '@/lib/types/auth';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    status: 'ACTIVE',
    emailVerified: true,
    mfaEnabled: true,
    tenantId: 'tenant-1',
    roles: [{ id: 'role-1', name: 'admin', displayName: 'Admin', isSystem: true, permissions: [], createdAt: '', updatedAt: '' }],
    permissions: [],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

describe('UsersTable', () => {
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user data correctly', () => {
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows MFA enabled indicator', () => {
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    expect(screen.getByLabelText(/mfa enabled/i)).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    await user.click(screen.getByRole('button', { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith('1');
  });
});
```

---

## 📁 MSW Handlers

### File: `test/mocks/handlers/auth.ts`

```typescript
import { http, HttpResponse } from 'msw';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  status: 'ACTIVE',
  emailVerified: true,
  mfaEnabled: false,
  tenantId: 'tenant-1',
  roles: [{ id: 'role-1', name: 'admin', displayName: 'Admin' }],
  permissions: ['users:read', 'users:write'],
};

export const authHandlers = [
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({ data: mockUser });
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/v1/auth/register', async () => {
    return HttpResponse.json({ message: 'Registration successful' }, { status: 201 });
  }),

  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),

  http.post('/api/v1/auth/forgot-password', () => {
    return HttpResponse.json({ message: 'Reset email sent' });
  }),

  http.get('/api/v1/admin/users', () => {
    return HttpResponse.json({
      data: [mockUser],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get('/api/v1/admin/users/:id', ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({ data: mockUser });
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.get('/api/v1/admin/roles', () => {
    return HttpResponse.json({
      data: [
        { id: 'role-1', name: 'admin', displayName: 'Admin', isSystem: true },
        { id: 'role-2', name: 'user', displayName: 'User', isSystem: true },
      ],
    });
  }),

  http.get('/api/v1/admin/permissions', () => {
    return HttpResponse.json({
      data: [
        { id: 'perm-1', code: 'users:read', name: 'Read Users', group: 'Users' },
        { id: 'perm-2', code: 'users:write', name: 'Write Users', group: 'Users' },
      ],
    });
  }),
];
```

---

## ✅ Completion Checklist

### Auth Components
- [ ] `components/auth/login-form.tsx`
- [ ] `components/auth/register-form.tsx`
- [ ] `components/auth/forgot-password-form.tsx`
- [ ] `components/auth/reset-password-form.tsx`
- [ ] `components/auth/mfa-input.tsx`
- [ ] `components/auth/mfa-setup-dialog.tsx`
- [ ] `components/auth/social-login-buttons.tsx`
- [ ] `components/auth/auth-layout.tsx`

### Admin Components
- [ ] `components/admin/users/users-table.tsx`
- [ ] `components/admin/users/user-form.tsx`
- [ ] `components/admin/users/user-detail-card.tsx`
- [ ] `components/admin/users/user-filters.tsx`
- [ ] `components/admin/roles/roles-table.tsx`
- [ ] `components/admin/roles/role-form.tsx`
- [ ] `components/admin/roles/role-permissions-editor.tsx`
- [ ] `components/admin/permissions/permissions-matrix.tsx`
- [ ] `components/admin/audit/audit-log-table.tsx`

### Profile Components
- [ ] `components/profile/profile-form.tsx`
- [ ] `components/profile/avatar-upload.tsx`
- [ ] `components/profile/password-change-form.tsx`
- [ ] `components/profile/mfa-settings.tsx`
- [ ] `components/profile/active-sessions.tsx`

### Auth Pages
- [ ] `app/(auth)/layout.tsx`
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/register/page.tsx`
- [ ] `app/(auth)/forgot-password/page.tsx`
- [ ] `app/(auth)/reset-password/page.tsx`
- [ ] `app/(auth)/verify-email/page.tsx`
- [ ] `app/(auth)/mfa/page.tsx`

### Admin Pages
- [ ] `app/(dashboard)/admin/users/page.tsx`
- [ ] `app/(dashboard)/admin/users/new/page.tsx`
- [ ] `app/(dashboard)/admin/users/[id]/page.tsx`
- [ ] `app/(dashboard)/admin/users/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/admin/roles/page.tsx`
- [ ] `app/(dashboard)/admin/roles/new/page.tsx`
- [ ] `app/(dashboard)/admin/roles/[id]/page.tsx`
- [ ] `app/(dashboard)/admin/permissions/page.tsx`
- [ ] `app/(dashboard)/admin/tenants/page.tsx`
- [ ] `app/(dashboard)/admin/audit-logs/page.tsx`
- [ ] `app/(dashboard)/admin/settings/page.tsx`
- [ ] `app/(dashboard)/profile/page.tsx`
- [ ] `app/(dashboard)/profile/security/page.tsx`

### Hooks & Stores
- [ ] `lib/types/auth.ts`
- [ ] `lib/validations/auth.ts`
- [ ] `lib/hooks/auth/use-auth.ts`
- [ ] `lib/hooks/admin/use-users.ts`
- [ ] `lib/hooks/admin/use-roles.ts`
- [ ] `lib/stores/auth-store.ts`
- [ ] `lib/stores/admin-store.ts`

### Tests
- [ ] `components/auth/login-form.test.tsx`
- [ ] `components/admin/users/users-table.test.tsx`
- [ ] `lib/hooks/auth/use-auth.test.ts`
- [ ] `test/mocks/handlers/auth.ts`
- [ ] All tests passing: `pnpm test`

### Verification
- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Lint passes: `pnpm lint`
- [ ] Manual testing complete

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [02-crm-ui.md](./02-crm-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [API Dev Prompt: Auth & Admin](../api-dev-prompts/01-auth-admin-api.md)
- [API Review: Auth & Admin](../../api-review-docs/01-auth-admin-review.html)
- [Service Documentation: Auth & Admin](../../02-services/08-service-auth-admin.md)
- [Frontend Architecture Standards](../../08-standards/68-frontend-architecture-standards.md)
