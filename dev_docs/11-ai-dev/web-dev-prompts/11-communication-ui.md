# 11 - Communication UI Implementation

> **Service:** Communication (Notifications, Emails, SMS)  
> **Priority:** P1 - High  
> **Pages:** 6  
> **API Endpoints:** 22  
> **Dependencies:** Foundation ✅, Auth API ✅, Communication API ✅  
> **Doc Reference:** [18-service-communication.md](../../02-services/18-service-communication.md)

---

## 📋 Overview

The Communication UI provides interfaces for managing notifications, email templates, SMS messages, and communication preferences. This includes inbox, notification center, template management, and communication history.

### Key Screens
- Notification center/inbox
- Email templates management
- SMS templates management
- Communication history
- Preference settings
- Compose message

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Communication API is deployed

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add textarea
npx shadcn@latest add tabs
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── communications/
│   ├── page.tsx                    # Communication dashboard
│   ├── inbox/
│   │   ├── page.tsx                # Notification inbox
│   │   └── [id]/
│   │       └── page.tsx            # Message detail
│   ├── compose/
│   │   └── page.tsx                # Compose message
│   ├── templates/
│   │   ├── page.tsx                # Templates list
│   │   ├── email/
│   │   │   ├── page.tsx            # Email templates
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Edit email template
│   │   └── sms/
│   │       ├── page.tsx            # SMS templates
│   │       └── [id]/
│   │           └── page.tsx        # Edit SMS template
│   ├── history/
│   │   └── page.tsx                # Communication log
│   └── settings/
│       └── page.tsx                # Preferences
```

---

## 🎨 Components to Create

```
components/communications/
├── notification-center.tsx         # Dropdown notification list
├── notification-bell.tsx           # Bell icon with badge
├── notification-item.tsx           # Single notification
├── inbox-list.tsx                  # Full inbox view
├── message-detail.tsx              # Message content
├── compose-form.tsx                # Compose new message
├── recipient-selector.tsx          # Select recipients
├── template-list.tsx               # Templates grid/list
├── template-card.tsx               # Template preview
├── email-template-editor.tsx       # Email template form
├── sms-template-editor.tsx         # SMS template form
├── template-variables.tsx          # Variable insertion
├── template-preview.tsx            # Live preview
├── communication-history.tsx       # Log table
├── preference-form.tsx             # User preferences
└── channel-toggle.tsx              # Enable/disable channels
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/communication.ts`

```typescript
export type NotificationType = 
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'ACTION_REQUIRED';

export type NotificationChannel = 
  | 'IN_APP'
  | 'EMAIL'
  | 'SMS'
  | 'PUSH';

export type CommunicationStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'READ';

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: CommunicationStatus;
  
  // Content
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  
  // Metadata
  category: string;
  entityType?: string;
  entityId?: string;
  
  // Recipient
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Timestamps
  sentAt: string;
  readAt?: string;
  
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  category: string;
  
  // Variables
  variables: TemplateVariable[];
  
  // Settings
  isActive: boolean;
  isSystem: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: string;
  
  // Variables
  variables: TemplateVariable[];
  
  // Settings
  isActive: boolean;
  isSystem: boolean;
  
  // Character count
  characterCount: number;
  segmentCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface CommunicationLog {
  id: string;
  channel: NotificationChannel;
  status: CommunicationStatus;
  
  // Content
  subject?: string;
  message: string;
  
  // Recipient
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Template
  templateId?: string;
  templateName?: string;
  
  // Tracking
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  
  // Reference
  entityType?: string;
  entityId?: string;
}

export interface UserPreferences {
  userId: string;
  
  // Channel preferences
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  
  // Notification categories
  categoryPreferences: Record<string, {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  
  // Digest
  digestEnabled: boolean;
  digestFrequency?: 'DAILY' | 'WEEKLY';
  
  updatedAt: string;
}

export interface ComposeMessageRequest {
  channel: NotificationChannel;
  recipientIds: string[];
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, string>;
  scheduleAt?: string;
}

export interface CommunicationDashboardData {
  unreadCount: number;
  sentToday: number;
  deliveryRate: number;
  byChannel: Array<{ channel: NotificationChannel; count: number }>;
  recentNotifications: Notification[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/communications/use-communications.ts`

```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Notification,
  EmailTemplate,
  SmsTemplate,
  CommunicationLog,
  UserPreferences,
  CommunicationDashboardData,
  ComposeMessageRequest,
} from '@/lib/types/communication';
import { toast } from 'sonner';

export const communicationKeys = {
  all: ['communications'] as const,
  dashboard: () => [...communicationKeys.all, 'dashboard'] as const,
  
  notifications: () => [...communicationKeys.all, 'notifications'] as const,
  notificationsList: (params?: Record<string, unknown>) => [...communicationKeys.notifications(), 'list', params] as const,
  notificationDetail: (id: string) => [...communicationKeys.notifications(), 'detail', id] as const,
  unreadCount: () => [...communicationKeys.notifications(), 'unread-count'] as const,
  
  emailTemplates: () => [...communicationKeys.all, 'email-templates'] as const,
  emailTemplateDetail: (id: string) => [...communicationKeys.emailTemplates(), id] as const,
  
  smsTemplates: () => [...communicationKeys.all, 'sms-templates'] as const,
  smsTemplateDetail: (id: string) => [...communicationKeys.smsTemplates(), id] as const,
  
  history: (params?: Record<string, unknown>) => [...communicationKeys.all, 'history', params] as const,
  
  preferences: () => [...communicationKeys.all, 'preferences'] as const,
};

// Dashboard
export function useCommunicationDashboard() {
  return useQuery({
    queryKey: communicationKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: CommunicationDashboardData }>('/communications/dashboard'),
  });
}

// Notifications
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: communicationKeys.notificationsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Notification>>('/communications/notifications', params),
  });
}

export function useNotificationsInfinite(params = {}) {
  return useInfiniteQuery({
    queryKey: communicationKeys.notificationsList(params),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Notification>>('/communications/notifications', { ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: communicationKeys.notificationDetail(id),
    queryFn: () => apiClient.get<{ data: Notification }>(`/communications/notifications/${id}`),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: communicationKeys.unreadCount(),
    queryFn: () => apiClient.get<{ count: number }>('/communications/notifications/unread-count'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/communications/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post('/communications/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount() });
      toast.success('All notifications marked as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/communications/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      toast.success('Notification deleted');
    },
  });
}

// Compose Message
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ComposeMessageRequest) =>
      apiClient.post('/communications/send', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.history() });
      toast.success('Message sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

// Email Templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: communicationKeys.emailTemplates(),
    queryFn: () => apiClient.get<{ data: EmailTemplate[] }>('/communications/templates/email'),
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: communicationKeys.emailTemplateDetail(id),
    queryFn: () => apiClient.get<{ data: EmailTemplate }>(`/communications/templates/email/${id}`),
    enabled: !!id,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<EmailTemplate>) =>
      apiClient.post<{ data: EmailTemplate }>('/communications/templates/email', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.emailTemplates() });
      toast.success('Email template created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) =>
      apiClient.patch<{ data: EmailTemplate }>(`/communications/templates/email/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.emailTemplateDetail(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.emailTemplates() });
      toast.success('Email template updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

// SMS Templates
export function useSmsTemplates() {
  return useQuery({
    queryKey: communicationKeys.smsTemplates(),
    queryFn: () => apiClient.get<{ data: SmsTemplate[] }>('/communications/templates/sms'),
  });
}

export function useSmsTemplate(id: string) {
  return useQuery({
    queryKey: communicationKeys.smsTemplateDetail(id),
    queryFn: () => apiClient.get<{ data: SmsTemplate }>(`/communications/templates/sms/${id}`),
    enabled: !!id,
  });
}

export function useCreateSmsTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SmsTemplate>) =>
      apiClient.post<{ data: SmsTemplate }>('/communications/templates/sms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.smsTemplates() });
      toast.success('SMS template created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

export function useUpdateSmsTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SmsTemplate> }) =>
      apiClient.patch<{ data: SmsTemplate }>(`/communications/templates/sms/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.smsTemplateDetail(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.smsTemplates() });
      toast.success('SMS template updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

// Communication History
export function useCommunicationHistory(params = {}) {
  return useQuery({
    queryKey: communicationKeys.history(params),
    queryFn: () => apiClient.get<PaginatedResponse<CommunicationLog>>('/communications/history', params),
  });
}

// User Preferences
export function useUserPreferences() {
  return useQuery({
    queryKey: communicationKeys.preferences(),
    queryFn: () => apiClient.get<{ data: UserPreferences }>('/communications/preferences'),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) =>
      apiClient.patch<{ data: UserPreferences }>('/communications/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.preferences() });
      toast.success('Preferences updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });
}

// Template Preview
export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Record<string, string> }) =>
      apiClient.post<{ html: string; text: string }>(`/communications/templates/${templateId}/preview`, data),
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/communication-store.ts`

```typescript
import { createStore } from './create-store';
import { NotificationChannel, NotificationType } from '@/lib/types/communication';

interface CommunicationFilters {
  channel: NotificationChannel | '';
  type: NotificationType | '';
  unreadOnly: boolean;
  dateRange: { from?: Date; to?: Date };
}

interface CommunicationState {
  filters: CommunicationFilters;
  selectedNotificationId: string | null;
  isComposeOpen: boolean;
  isNotificationCenterOpen: boolean;
  composeChannel: NotificationChannel;
  selectedTemplateId: string | null;
  
  setFilter: <K extends keyof CommunicationFilters>(key: K, value: CommunicationFilters[K]) => void;
  resetFilters: () => void;
  setSelectedNotification: (id: string | null) => void;
  setComposeOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  setComposeChannel: (channel: NotificationChannel) => void;
  setSelectedTemplate: (id: string | null) => void;
}

const defaultFilters: CommunicationFilters = {
  channel: '',
  type: '',
  unreadOnly: false,
  dateRange: {},
};

export const useCommunicationStore = createStore<CommunicationState>('communication-store', (set, get) => ({
  filters: defaultFilters,
  selectedNotificationId: null,
  isComposeOpen: false,
  isNotificationCenterOpen: false,
  composeChannel: 'EMAIL',
  selectedTemplateId: null,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedNotification: (id) => set({ selectedNotificationId: id }),
  
  setComposeOpen: (open) => set({ isComposeOpen: open }),
  
  setNotificationCenterOpen: (open) => set({ isNotificationCenterOpen: open }),
  
  setComposeChannel: (channel) => set({ composeChannel: channel }),
  
  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/communication.ts`

```typescript
import { z } from 'zod';

export const composeMessageSchema = z.object({
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']),
  recipientIds: z.array(z.string()).min(1, 'At least one recipient is required'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  templateId: z.string().optional(),
  templateData: z.record(z.string()).optional(),
  scheduleAt: z.string().optional(),
});

export const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  bodyHtml: z.string().min(1, 'HTML body is required'),
  bodyText: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
});

export const smsTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
});

export const userPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  categoryPreferences: z.record(z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  })).optional(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  quietHoursTimezone: z.string().optional(),
  digestEnabled: z.boolean(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY']).optional(),
});

export type ComposeMessageData = z.infer<typeof composeMessageSchema>;
export type EmailTemplateData = z.infer<typeof emailTemplateSchema>;
export type SmsTemplateData = z.infer<typeof smsTemplateSchema>;
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;
```

---

## 🔔 Notification Center Component

This component will be used globally in the app header:

### File: `components/communications/notification-bell.tsx`

```typescript
'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUnreadCount } from '@/lib/hooks/communications/use-communications';
import { useCommunicationStore } from '@/lib/stores/communication-store';
import { NotificationCenter } from './notification-center';

export function NotificationBell() {
  const { data: unreadData } = useUnreadCount();
  const { isNotificationCenterOpen, setNotificationCenterOpen } = useCommunicationStore();
  
  const unreadCount = unreadData?.count ?? 0;
  
  return (
    <Popover open={isNotificationCenterOpen} onOpenChange={setNotificationCenterOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/communications/notification-center.tsx`
- [ ] `components/communications/notification-bell.tsx`
- [ ] `components/communications/notification-item.tsx`
- [ ] `components/communications/inbox-list.tsx`
- [ ] `components/communications/message-detail.tsx`
- [ ] `components/communications/compose-form.tsx`
- [ ] `components/communications/recipient-selector.tsx`
- [ ] `components/communications/template-list.tsx`
- [ ] `components/communications/template-card.tsx`
- [ ] `components/communications/email-template-editor.tsx`
- [ ] `components/communications/sms-template-editor.tsx`
- [ ] `components/communications/template-variables.tsx`
- [ ] `components/communications/template-preview.tsx`
- [ ] `components/communications/communication-history.tsx`
- [ ] `components/communications/preference-form.tsx`
- [ ] `components/communications/channel-toggle.tsx`

### Pages
- [ ] `app/(dashboard)/communications/page.tsx`
- [ ] `app/(dashboard)/communications/inbox/page.tsx`
- [ ] `app/(dashboard)/communications/inbox/[id]/page.tsx`
- [ ] `app/(dashboard)/communications/compose/page.tsx`
- [ ] `app/(dashboard)/communications/templates/page.tsx`
- [ ] `app/(dashboard)/communications/templates/email/page.tsx`
- [ ] `app/(dashboard)/communications/templates/email/[id]/page.tsx`
- [ ] `app/(dashboard)/communications/templates/sms/page.tsx`
- [ ] `app/(dashboard)/communications/templates/sms/[id]/page.tsx`
- [ ] `app/(dashboard)/communications/history/page.tsx`
- [ ] `app/(dashboard)/communications/settings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/communication.ts`
- [ ] `lib/validations/communication.ts`
- [ ] `lib/hooks/communications/use-communications.ts`
- [ ] `lib/stores/communication-store.ts`

### Integration
- [ ] Add `NotificationBell` to app header
- [ ] Add notification polling/WebSocket

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [12-customer-portal-ui.md](./12-customer-portal-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/18-service-communication.md)
- [API Review](../../api-review-docs/11-communication-review.html)
