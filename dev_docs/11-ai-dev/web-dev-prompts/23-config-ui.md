# 23 - Config UI Implementation

> **Service:** Config (System Configuration & Settings)  
> **Priority:** P2 - Medium  
> **Pages:** 5  
> **API Endpoints:** 16  
> **Dependencies:** Foundation ✅, Auth API ✅, Config API ✅  
> **Doc Reference:** [30-service-config.md](../../02-services/30-service-config.md)

---

## 📋 Overview

The Config UI provides interfaces for managing system-wide configuration, tenant settings, feature flags, and application preferences. This includes company settings, operational defaults, and customization options.

### Key Screens
- Settings dashboard
- Company settings
- System settings
- Feature flags
- Notification preferences
- Custom fields

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Config API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── settings/
│   ├── page.tsx                    # Settings overview
│   ├── company/
│   │   └── page.tsx                # Company settings
│   ├── system/
│   │   └── page.tsx                # System settings
│   ├── features/
│   │   └── page.tsx                # Feature flags
│   ├── notifications/
│   │   └── page.tsx                # Notification settings
│   └── custom-fields/
│       └── page.tsx                # Custom field config
```

---

## 🎨 Components to Create

```
components/settings/
├── settings-nav.tsx                # Settings navigation
├── settings-section.tsx            # Section wrapper
├── settings-card.tsx               # Setting card
├── company-info-form.tsx           # Company details
├── company-logo-upload.tsx         # Logo management
├── company-address-form.tsx        # Address settings
├── business-hours-form.tsx         # Operating hours
├── system-defaults-form.tsx        # Default values
├── numbering-config.tsx            # Auto-numbering
├── timezone-selector.tsx           # Timezone setting
├── currency-selector.tsx           # Currency setting
├── date-format-selector.tsx        # Date format
├── feature-flag-list.tsx           # Feature toggles
├── feature-flag-card.tsx           # Single feature
├── notification-settings.tsx       # Email/SMS prefs
├── notification-template.tsx       # Template config
├── custom-field-list.tsx           # Custom fields
├── custom-field-form.tsx           # Add/edit field
├── field-type-selector.tsx         # Field type picker
├── integration-settings.tsx        # API keys, etc
└── save-settings-button.tsx        # Save action
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/config.ts`

```typescript
export interface CompanySettings {
  id: string;
  
  // Basic Info
  name: string;
  legalName?: string;
  dba?: string;
  
  // Contact
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  
  // Address
  address: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  
  // Legal
  mcNumber?: string;
  dotNumber?: string;
  taxId?: string;
  
  // Business Hours
  businessHours: BusinessHours;
  
  updatedAt: string;
}

export interface BusinessHours {
  timezone: string;
  days: {
    [key: string]: { // 'monday', 'tuesday', etc.
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  };
}

export interface SystemSettings {
  // Regional
  defaultTimezone: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Numbering
  loadNumberPrefix: string;
  loadNumberFormat: string;
  loadNumberNextValue: number;
  invoiceNumberPrefix: string;
  invoiceNumberFormat: string;
  invoiceNumberNextValue: number;
  quoteNumberPrefix: string;
  quoteNumberNextValue: number;
  
  // Defaults
  defaultPaymentTerms: string;
  defaultPaymentTermsDays: number;
  defaultLoadType: string;
  defaultEquipmentType: string;
  
  // Automation
  autoCreateInvoice: boolean;
  autoSendInvoice: boolean;
  autoSendDeliveryConfirmation: boolean;
  
  // Security
  sessionTimeoutMinutes: number;
  requireMfa: boolean;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  
  // Status
  isEnabled: boolean;
  
  // Targeting
  enabledFor: 'ALL' | 'NONE' | 'PERCENTAGE' | 'USERS' | 'ROLES';
  percentage?: number;
  userIds?: string[];
  roleIds?: string[];
  
  // Metadata
  category: string;
  isExperimental: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  // Email
  emailEnabled: boolean;
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo?: string;
  
  // SMTP (if custom)
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  
  // SMS
  smsEnabled: boolean;
  smsProvider?: string;
  smsFromNumber?: string;
  
  // Templates
  templates: NotificationTemplate[];
  
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  description?: string;
  
  // Channels
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  
  // Content
  emailSubject?: string;
  emailBody?: string;
  smsBody?: string;
  
  // Variables
  availableVariables: string[];
  
  isDefault: boolean;
  
  updatedAt: string;
}

export interface CustomField {
  id: string;
  
  // Definition
  key: string;
  label: string;
  description?: string;
  
  // Type
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'TEXTAREA';
  options?: { value: string; label: string }[];
  
  // Entity
  entityType: 'CUSTOMER' | 'CARRIER' | 'LOAD' | 'ORDER' | 'INVOICE';
  
  // Validation
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  
  // Display
  order: number;
  isVisible: boolean;
  showInTable: boolean;
  showInForm: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  permissions: string[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/config/use-config.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  CompanySettings,
  SystemSettings,
  FeatureFlag,
  NotificationSettings,
  NotificationTemplate,
  CustomField,
} from '@/lib/types/config';
import { toast } from 'sonner';

export const configKeys = {
  all: ['config'] as const,
  
  company: () => [...configKeys.all, 'company'] as const,
  system: () => [...configKeys.all, 'system'] as const,
  
  features: () => [...configKeys.all, 'features'] as const,
  featureDetail: (key: string) => [...configKeys.features(), key] as const,
  
  notifications: () => [...configKeys.all, 'notifications'] as const,
  templates: () => [...configKeys.all, 'templates'] as const,
  templateDetail: (id: string) => [...configKeys.templates(), id] as const,
  
  customFields: () => [...configKeys.all, 'custom-fields'] as const,
  customFieldsList: (entityType?: string) => [...configKeys.customFields(), entityType] as const,
  customFieldDetail: (id: string) => [...configKeys.customFields(), 'detail', id] as const,
};

// Company Settings
export function useCompanySettings() {
  return useQuery({
    queryKey: configKeys.company(),
    queryFn: () => apiClient.get<{ data: CompanySettings }>('/config/company'),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) =>
      apiClient.patch<{ data: CompanySettings }>('/config/company', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.company() });
      toast.success('Company settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      return apiClient.post<{ logoUrl: string }>('/config/company/logo', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.company() });
      toast.success('Logo uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload logo');
    },
  });
}

// System Settings
export function useSystemSettings() {
  return useQuery({
    queryKey: configKeys.system(),
    queryFn: () => apiClient.get<{ data: SystemSettings }>('/config/system'),
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SystemSettings>) =>
      apiClient.patch<{ data: SystemSettings }>('/config/system', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.system() });
      toast.success('System settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });
}

// Feature Flags
export function useFeatureFlags() {
  return useQuery({
    queryKey: configKeys.features(),
    queryFn: () => apiClient.get<{ data: FeatureFlag[] }>('/config/features'),
  });
}

export function useFeatureFlag(key: string) {
  return useQuery({
    queryKey: configKeys.featureDetail(key),
    queryFn: () => apiClient.get<{ data: FeatureFlag }>(`/config/features/${key}`),
    enabled: !!key,
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, isEnabled }: { key: string; isEnabled: boolean }) =>
      apiClient.patch(`/config/features/${key}`, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.features() });
      toast.success('Feature updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update feature');
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: Partial<FeatureFlag> }) =>
      apiClient.patch<{ data: FeatureFlag }>(`/config/features/${key}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.features() });
      toast.success('Feature flag updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update');
    },
  });
}

// Notifications
export function useNotificationSettings() {
  return useQuery({
    queryKey: configKeys.notifications(),
    queryFn: () => apiClient.get<{ data: NotificationSettings }>('/config/notifications'),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      apiClient.patch<{ data: NotificationSettings }>('/config/notifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.notifications() });
      toast.success('Notification settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: configKeys.templates(),
    queryFn: () => apiClient.get<{ data: NotificationTemplate[] }>('/config/notifications/templates'),
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationTemplate> }) =>
      apiClient.patch<{ data: NotificationTemplate }>(`/config/notifications/templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.templates() });
      toast.success('Template updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

export function useTestNotification() {
  return useMutation({
    mutationFn: ({ templateId, channel, recipient }: { 
      templateId: string; 
      channel: 'EMAIL' | 'SMS';
      recipient: string;
    }) =>
      apiClient.post('/config/notifications/test', { templateId, channel, recipient }),
    onSuccess: () => {
      toast.success('Test notification sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send test');
    },
  });
}

// Custom Fields
export function useCustomFields(entityType?: string) {
  return useQuery({
    queryKey: configKeys.customFieldsList(entityType),
    queryFn: () => apiClient.get<{ data: CustomField[] }>('/config/custom-fields', 
      entityType ? { entityType } : undefined
    ),
  });
}

export function useCustomField(id: string) {
  return useQuery({
    queryKey: configKeys.customFieldDetail(id),
    queryFn: () => apiClient.get<{ data: CustomField }>(`/config/custom-fields/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CustomField>) =>
      apiClient.post<{ data: CustomField }>('/config/custom-fields', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.customFields() });
      toast.success('Custom field created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create field');
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomField> }) =>
      apiClient.patch<{ data: CustomField }>(`/config/custom-fields/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.customFields() });
      toast.success('Custom field updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update field');
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/config/custom-fields/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.customFields() });
      toast.success('Custom field deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete field');
    },
  });
}

export function useReorderCustomFields() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fieldIds: string[]) =>
      apiClient.post('/config/custom-fields/reorder', { fieldIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.customFields() });
      toast.success('Fields reordered');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/config-store.ts`

```typescript
import { createStore } from './create-store';

interface ConfigState {
  activeSection: string;
  hasUnsavedChanges: boolean;
  selectedFieldId: string | null;
  isFieldDialogOpen: boolean;
  isTemplateDialogOpen: boolean;
  
  setActiveSection: (section: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setSelectedField: (id: string | null) => void;
  setFieldDialogOpen: (open: boolean) => void;
  setTemplateDialogOpen: (open: boolean) => void;
}

export const useConfigStore = createStore<ConfigState>('config-store', (set) => ({
  activeSection: 'company',
  hasUnsavedChanges: false,
  selectedFieldId: null,
  isFieldDialogOpen: false,
  isTemplateDialogOpen: false,
  
  setActiveSection: (section) => set({ activeSection: section }),
  
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
  
  setSelectedField: (id) => set({ selectedFieldId: id }),
  
  setFieldDialogOpen: (open) => set({ isFieldDialogOpen: open }),
  
  setTemplateDialogOpen: (open) => set({ isTemplateDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/config.ts`

```typescript
import { z } from 'zod';

export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  dba: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  fax: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP is required'),
    country: z.string().default('USA'),
  }),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  taxId: z.string().optional(),
});

export const systemSettingsSchema = z.object({
  defaultTimezone: z.string().min(1, 'Timezone is required'),
  defaultCurrency: z.string().min(3).max(3),
  dateFormat: z.string().min(1),
  timeFormat: z.enum(['12h', '24h']),
  loadNumberPrefix: z.string().max(10),
  invoiceNumberPrefix: z.string().max(10),
  quoteNumberPrefix: z.string().max(10),
  defaultPaymentTerms: z.string(),
  defaultPaymentTermsDays: z.number().int().positive(),
  sessionTimeoutMinutes: z.number().int().min(5).max(480),
  passwordMinLength: z.number().int().min(8).max(32),
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  emailFromName: z.string().min(1, 'From name is required'),
  emailFromAddress: z.string().email('Invalid email'),
  emailReplyTo: z.string().email().optional().or(z.literal('')),
  smsEnabled: z.boolean(),
  smsFromNumber: z.string().optional(),
});

export const notificationTemplateSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  smsBody: z.string().max(160).optional(),
});

export const customFieldSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z_]+$/, 'Key must be lowercase with underscores'),
  label: z.string().min(1, 'Label is required'),
  description: z.string().optional(),
  fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'TEXTAREA']),
  entityType: z.enum(['CUSTOMER', 'CARRIER', 'LOAD', 'ORDER', 'INVOICE']),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  isRequired: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  showInTable: z.boolean().default(false),
  showInForm: z.boolean().default(true),
});

export type CompanySettingsData = z.infer<typeof companySettingsSchema>;
export type SystemSettingsData = z.infer<typeof systemSettingsSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
export type NotificationTemplateData = z.infer<typeof notificationTemplateSchema>;
export type CustomFieldData = z.infer<typeof customFieldSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/settings/settings-nav.tsx`
- [ ] `components/settings/settings-section.tsx`
- [ ] `components/settings/settings-card.tsx`
- [ ] `components/settings/company-info-form.tsx`
- [ ] `components/settings/company-logo-upload.tsx`
- [ ] `components/settings/company-address-form.tsx`
- [ ] `components/settings/business-hours-form.tsx`
- [ ] `components/settings/system-defaults-form.tsx`
- [ ] `components/settings/numbering-config.tsx`
- [ ] `components/settings/timezone-selector.tsx`
- [ ] `components/settings/currency-selector.tsx`
- [ ] `components/settings/date-format-selector.tsx`
- [ ] `components/settings/feature-flag-list.tsx`
- [ ] `components/settings/feature-flag-card.tsx`
- [ ] `components/settings/notification-settings.tsx`
- [ ] `components/settings/notification-template.tsx`
- [ ] `components/settings/custom-field-list.tsx`
- [ ] `components/settings/custom-field-form.tsx`
- [ ] `components/settings/field-type-selector.tsx`
- [ ] `components/settings/integration-settings.tsx`
- [ ] `components/settings/save-settings-button.tsx`

### Pages
- [ ] `app/(dashboard)/settings/page.tsx`
- [ ] `app/(dashboard)/settings/company/page.tsx`
- [ ] `app/(dashboard)/settings/system/page.tsx`
- [ ] `app/(dashboard)/settings/features/page.tsx`
- [ ] `app/(dashboard)/settings/notifications/page.tsx`
- [ ] `app/(dashboard)/settings/custom-fields/page.tsx`

### Hooks & Stores
- [ ] `lib/types/config.ts`
- [ ] `lib/validations/config.ts`
- [ ] `lib/hooks/config/use-config.ts`
- [ ] `lib/stores/config-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [24-edi-ui.md](./24-edi-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/30-service-config.md)
- [API Review](../../api-review-docs/23-config-review.html)
