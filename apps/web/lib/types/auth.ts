export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'LOCKED' | 'INVITED';

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
  companyName?: string;
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

