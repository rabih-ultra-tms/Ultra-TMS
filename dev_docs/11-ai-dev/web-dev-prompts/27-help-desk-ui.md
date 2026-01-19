# 27 - Help Desk UI Implementation

> **Service:** Help Desk (Internal Support & Ticketing)  
> **Priority:** P3 - Low  
> **Pages:** 5  
> **API Endpoints:** 18  
> **Dependencies:** Foundation ✅, Auth API ✅, Help Desk API ✅  
> **Doc Reference:** [33-service-help-desk.md](../../02-services/33-service-help-desk.md)

---

## 📋 Overview

The Help Desk UI provides interfaces for internal support ticketing, knowledge base access, FAQ management, and support analytics. This enables employees to get help and IT/support teams to manage requests.

### Key Screens
- Help desk dashboard
- My tickets
- All tickets (support view)
- Knowledge base
- FAQ management
- Support analytics

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Help Desk API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── help/
│   ├── page.tsx                    # Help center home
│   ├── tickets/
│   │   ├── page.tsx                # My tickets
│   │   ├── new/
│   │   │   └── page.tsx            # Create ticket
│   │   └── [id]/
│   │       └── page.tsx            # Ticket detail
│   ├── kb/
│   │   ├── page.tsx                # Knowledge base
│   │   └── [slug]/
│   │       └── page.tsx            # Article view
│   └── faq/
│       └── page.tsx                # FAQ
│
├── admin/
│   └── support/
│       ├── page.tsx                # Support dashboard
│       ├── tickets/
│       │   └── page.tsx            # All tickets
│       ├── kb/
│       │   ├── page.tsx            # KB management
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx    # Edit article
│       └── analytics/
│           └── page.tsx            # Support analytics
```

---

## 🎨 Components to Create

```
components/help-desk/
├── help-center-home.tsx            # Main help page
├── quick-links.tsx                 # Common actions
├── ticket-form.tsx                 # Create ticket
├── my-tickets-table.tsx            # User's tickets
├── ticket-card.tsx                 # Ticket summary
├── ticket-detail.tsx               # Full ticket
├── ticket-timeline.tsx             # Activity history
├── ticket-reply-form.tsx           # Add reply
├── ticket-status-badge.tsx         # Status display
├── priority-badge.tsx              # Priority display
├── all-tickets-table.tsx           # Support view
├── ticket-filters.tsx              # Filter controls
├── assign-ticket-form.tsx          # Assign to agent
├── knowledge-base-search.tsx       # KB search
├── article-list.tsx                # Articles grid
├── article-card.tsx                # Article preview
├── article-view.tsx                # Full article
├── article-editor.tsx              # Create/edit
├── category-nav.tsx                # KB categories
├── faq-list.tsx                    # FAQ accordion
├── faq-item.tsx                    # Single FAQ
├── support-dashboard-stats.tsx     # Support metrics
├── ticket-volume-chart.tsx         # Ticket trends
├── resolution-time-chart.tsx       # SLA metrics
└── agent-performance.tsx           # Agent stats
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/help-desk.ts`

```typescript
export type TicketStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_USER'
  | 'WAITING_ON_THIRD_PARTY'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketCategory = 
  | 'TECHNICAL'
  | 'BILLING'
  | 'ACCOUNT'
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'TRAINING'
  | 'OTHER';

export interface Ticket {
  id: string;
  ticketNumber: string;
  
  // Content
  subject: string;
  description: string;
  
  // Classification
  category: TicketCategory;
  priority: TicketPriority;
  
  // Status
  status: TicketStatus;
  
  // Requester
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  
  // Assignment
  assignedToId?: string;
  assignedToName?: string;
  teamId?: string;
  teamName?: string;
  
  // SLA
  dueAt?: string;
  isOverdue: boolean;
  firstResponseAt?: string;
  resolvedAt?: string;
  
  // Attachments
  attachments: Attachment[];
  
  // Related
  relatedEntityType?: string;
  relatedEntityId?: string;
  
  // Tags
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  
  // Content
  content: string;
  isInternalNote: boolean;
  
  // Author
  authorId: string;
  authorName: string;
  authorRole: 'USER' | 'AGENT' | 'SYSTEM';
  
  // Attachments
  attachments: Attachment[];
  
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'PRIORITY_CHANGE' | 'REPLY' | 'NOTE' | 'ATTACHMENT';
  
  description: string;
  
  previousValue?: string;
  newValue?: string;
  
  actorId: string;
  actorName: string;
  
  createdAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  slug: string;
  
  // Content
  title: string;
  summary: string;
  content: string; // Markdown/HTML
  
  // Organization
  categoryId: string;
  categoryName: string;
  tags: string[];
  
  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  
  // Visibility
  isPublic: boolean;
  
  // Stats
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  
  // Author
  authorId: string;
  authorName: string;
  
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  order: number;
  articleCount: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  
  categoryId?: string;
  categoryName?: string;
  
  order: number;
  isPublished: boolean;
  
  viewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface SupportAgent {
  id: string;
  userId: string;
  name: string;
  email: string;
  
  teamId?: string;
  teamName?: string;
  
  // Stats
  openTickets: number;
  resolvedToday: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  
  isActive: boolean;
  isAvailable: boolean;
}

export interface SupportDashboardData {
  // Overview
  openTickets: number;
  newToday: number;
  resolvedToday: number;
  overdueTickets: number;
  
  // SLA
  avgFirstResponse: number; // minutes
  avgResolutionTime: number; // hours
  slaCompliance: number; // percentage
  
  // By Status
  ticketsByStatus: Array<{ status: TicketStatus; count: number }>;
  
  // By Priority
  ticketsByPriority: Array<{ priority: TicketPriority; count: number }>;
  
  // Trends
  ticketVolume: Array<{ date: string; created: number; resolved: number }>;
  
  // Agents
  topAgents: Array<{ id: string; name: string; resolved: number; satisfaction: number }>;
  
  // Recent
  recentTickets: Ticket[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/help-desk/use-help-desk.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Ticket,
  TicketReply,
  TicketActivity,
  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  FAQ,
  SupportDashboardData,
} from '@/lib/types/help-desk';
import { toast } from 'sonner';

export const helpDeskKeys = {
  all: ['help-desk'] as const,
  dashboard: () => [...helpDeskKeys.all, 'dashboard'] as const,
  
  tickets: () => [...helpDeskKeys.all, 'tickets'] as const,
  myTickets: (params?: Record<string, unknown>) => [...helpDeskKeys.tickets(), 'my', params] as const,
  allTickets: (params?: Record<string, unknown>) => [...helpDeskKeys.tickets(), 'all', params] as const,
  ticketDetail: (id: string) => [...helpDeskKeys.tickets(), id] as const,
  ticketReplies: (id: string) => [...helpDeskKeys.tickets(), id, 'replies'] as const,
  ticketActivity: (id: string) => [...helpDeskKeys.tickets(), id, 'activity'] as const,
  
  kb: () => [...helpDeskKeys.all, 'kb'] as const,
  kbCategories: () => [...helpDeskKeys.kb(), 'categories'] as const,
  kbArticles: (params?: Record<string, unknown>) => [...helpDeskKeys.kb(), 'articles', params] as const,
  kbArticle: (slug: string) => [...helpDeskKeys.kb(), 'article', slug] as const,
  kbSearch: (query: string) => [...helpDeskKeys.kb(), 'search', query] as const,
  
  faq: () => [...helpDeskKeys.all, 'faq'] as const,
  faqList: (params?: Record<string, unknown>) => [...helpDeskKeys.faq(), 'list', params] as const,
};

// Support Dashboard
export function useSupportDashboard() {
  return useQuery({
    queryKey: helpDeskKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: SupportDashboardData }>('/help-desk/dashboard'),
  });
}

// Tickets
export function useMyTickets(params = {}) {
  return useQuery({
    queryKey: helpDeskKeys.myTickets(params),
    queryFn: () => apiClient.get<PaginatedResponse<Ticket>>('/help-desk/tickets/my', params),
  });
}

export function useAllTickets(params = {}) {
  return useQuery({
    queryKey: helpDeskKeys.allTickets(params),
    queryFn: () => apiClient.get<PaginatedResponse<Ticket>>('/help-desk/tickets', params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: helpDeskKeys.ticketDetail(id),
    queryFn: () => apiClient.get<{ data: Ticket }>(`/help-desk/tickets/${id}`),
    enabled: !!id,
  });
}

export function useTicketReplies(ticketId: string) {
  return useQuery({
    queryKey: helpDeskKeys.ticketReplies(ticketId),
    queryFn: () => apiClient.get<{ data: TicketReply[] }>(`/help-desk/tickets/${ticketId}/replies`),
    enabled: !!ticketId,
  });
}

export function useTicketActivity(ticketId: string) {
  return useQuery({
    queryKey: helpDeskKeys.ticketActivity(ticketId),
    queryFn: () => apiClient.get<{ data: TicketActivity[] }>(`/help-desk/tickets/${ticketId}/activity`),
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Ticket>) =>
      apiClient.post<{ data: Ticket }>('/help-desk/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.tickets() });
      toast.success('Ticket created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket');
    },
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, content, isInternalNote, attachments }: { 
      ticketId: string; 
      content: string;
      isInternalNote?: boolean;
      attachments?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', content);
      if (isInternalNote) formData.append('isInternalNote', 'true');
      attachments?.forEach(file => formData.append('attachments', file));
      return apiClient.post(`/help-desk/tickets/${ticketId}/replies`, formData);
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.ticketReplies(ticketId) });
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.ticketDetail(ticketId) });
      toast.success('Reply added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add reply');
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      apiClient.patch<{ data: Ticket }>(`/help-desk/tickets/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.ticketDetail(id) });
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.tickets() });
      toast.success('Ticket updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update ticket');
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      apiClient.post(`/help-desk/tickets/${id}/assign`, { assignedToId }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.ticketDetail(id) });
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.tickets() });
      toast.success('Ticket assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign ticket');
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      apiClient.post(`/help-desk/tickets/${id}/resolve`, { resolution }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.ticketDetail(id) });
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.tickets() });
      toast.success('Ticket resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve ticket');
    },
  });
}

// Knowledge Base
export function useKBCategories() {
  return useQuery({
    queryKey: helpDeskKeys.kbCategories(),
    queryFn: () => apiClient.get<{ data: KnowledgeBaseCategory[] }>('/help-desk/kb/categories'),
  });
}

export function useKBArticles(params = {}) {
  return useQuery({
    queryKey: helpDeskKeys.kbArticles(params),
    queryFn: () => apiClient.get<PaginatedResponse<KnowledgeBaseArticle>>('/help-desk/kb/articles', params),
  });
}

export function useKBArticle(slug: string) {
  return useQuery({
    queryKey: helpDeskKeys.kbArticle(slug),
    queryFn: () => apiClient.get<{ data: KnowledgeBaseArticle }>(`/help-desk/kb/articles/${slug}`),
    enabled: !!slug,
  });
}

export function useKBSearch(query: string) {
  return useQuery({
    queryKey: helpDeskKeys.kbSearch(query),
    queryFn: () => apiClient.get<{ data: KnowledgeBaseArticle[] }>('/help-desk/kb/search', { q: query }),
    enabled: query.length >= 2,
  });
}

export function useCreateKBArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<KnowledgeBaseArticle>) =>
      apiClient.post<{ data: KnowledgeBaseArticle }>('/help-desk/kb/articles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.kb() });
      toast.success('Article created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create article');
    },
  });
}

export function useUpdateKBArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KnowledgeBaseArticle> }) =>
      apiClient.patch<{ data: KnowledgeBaseArticle }>(`/help-desk/kb/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpDeskKeys.kb() });
      toast.success('Article updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update article');
    },
  });
}

export function useRateArticle() {
  return useMutation({
    mutationFn: ({ articleId, helpful }: { articleId: string; helpful: boolean }) =>
      apiClient.post(`/help-desk/kb/articles/${articleId}/rate`, { helpful }),
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
    },
  });
}

// FAQ
export function useFAQs(params = {}) {
  return useQuery({
    queryKey: helpDeskKeys.faqList(params),
    queryFn: () => apiClient.get<{ data: FAQ[] }>('/help-desk/faq', params),
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/help-desk-store.ts`

```typescript
import { createStore } from './create-store';
import { TicketStatus, TicketPriority, TicketCategory } from '@/lib/types/help-desk';

interface HelpDeskFilters {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  category: TicketCategory | '';
  assignedToId: string;
  dateRange: { from?: Date; to?: Date };
}

interface HelpDeskState {
  filters: HelpDeskFilters;
  selectedTicketId: string | null;
  isTicketDialogOpen: boolean;
  isArticleDialogOpen: boolean;
  kbSearchQuery: string;
  
  setFilter: <K extends keyof HelpDeskFilters>(key: K, value: HelpDeskFilters[K]) => void;
  resetFilters: () => void;
  setSelectedTicket: (id: string | null) => void;
  setTicketDialogOpen: (open: boolean) => void;
  setArticleDialogOpen: (open: boolean) => void;
  setKBSearchQuery: (query: string) => void;
}

const defaultFilters: HelpDeskFilters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  assignedToId: '',
  dateRange: {},
};

export const useHelpDeskStore = createStore<HelpDeskState>('help-desk-store', (set, get) => ({
  filters: defaultFilters,
  selectedTicketId: null,
  isTicketDialogOpen: false,
  isArticleDialogOpen: false,
  kbSearchQuery: '',
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedTicket: (id) => set({ selectedTicketId: id }),
  
  setTicketDialogOpen: (open) => set({ isTicketDialogOpen: open }),
  
  setArticleDialogOpen: (open) => set({ isArticleDialogOpen: open }),
  
  setKBSearchQuery: (query) => set({ kbSearchQuery: query }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/help-desk.ts`

```typescript
import { z } from 'zod';

export const ticketFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['TECHNICAL', 'BILLING', 'ACCOUNT', 'FEATURE_REQUEST', 'BUG_REPORT', 'TRAINING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
});

export const ticketReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  isInternalNote: z.boolean().default(false),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().min(1, 'Agent is required'),
});

export const resolveTicketSchema = z.object({
  resolution: z.string().optional(),
});

export const kbArticleFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  summary: z.string().min(10, 'Summary is required').max(500),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isPublic: z.boolean().default(false),
});

export const faqFormSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  categoryId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;
export type TicketReplyData = z.infer<typeof ticketReplySchema>;
export type AssignTicketData = z.infer<typeof assignTicketSchema>;
export type ResolveTicketData = z.infer<typeof resolveTicketSchema>;
export type KBArticleFormData = z.infer<typeof kbArticleFormSchema>;
export type FAQFormData = z.infer<typeof faqFormSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/help-desk/help-center-home.tsx`
- [ ] `components/help-desk/quick-links.tsx`
- [ ] `components/help-desk/ticket-form.tsx`
- [ ] `components/help-desk/my-tickets-table.tsx`
- [ ] `components/help-desk/ticket-card.tsx`
- [ ] `components/help-desk/ticket-detail.tsx`
- [ ] `components/help-desk/ticket-timeline.tsx`
- [ ] `components/help-desk/ticket-reply-form.tsx`
- [ ] `components/help-desk/ticket-status-badge.tsx`
- [ ] `components/help-desk/priority-badge.tsx`
- [ ] `components/help-desk/all-tickets-table.tsx`
- [ ] `components/help-desk/ticket-filters.tsx`
- [ ] `components/help-desk/assign-ticket-form.tsx`
- [ ] `components/help-desk/knowledge-base-search.tsx`
- [ ] `components/help-desk/article-list.tsx`
- [ ] `components/help-desk/article-card.tsx`
- [ ] `components/help-desk/article-view.tsx`
- [ ] `components/help-desk/article-editor.tsx`
- [ ] `components/help-desk/category-nav.tsx`
- [ ] `components/help-desk/faq-list.tsx`
- [ ] `components/help-desk/faq-item.tsx`
- [ ] `components/help-desk/support-dashboard-stats.tsx`
- [ ] `components/help-desk/ticket-volume-chart.tsx`
- [ ] `components/help-desk/resolution-time-chart.tsx`
- [ ] `components/help-desk/agent-performance.tsx`

### Pages
- [ ] `app/(dashboard)/help/page.tsx`
- [ ] `app/(dashboard)/help/tickets/page.tsx`
- [ ] `app/(dashboard)/help/tickets/new/page.tsx`
- [ ] `app/(dashboard)/help/tickets/[id]/page.tsx`
- [ ] `app/(dashboard)/help/kb/page.tsx`
- [ ] `app/(dashboard)/help/kb/[slug]/page.tsx`
- [ ] `app/(dashboard)/help/faq/page.tsx`
- [ ] `app/(dashboard)/admin/support/page.tsx`
- [ ] `app/(dashboard)/admin/support/tickets/page.tsx`
- [ ] `app/(dashboard)/admin/support/kb/page.tsx`
- [ ] `app/(dashboard)/admin/support/kb/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/admin/support/analytics/page.tsx`

### Hooks & Stores
- [ ] `lib/types/help-desk.ts`
- [ ] `lib/validations/help-desk.ts`
- [ ] `lib/hooks/help-desk/use-help-desk.ts`
- [ ] `lib/stores/help-desk-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🎉 Final Notes

This is the last prompt in the Phase A Frontend Implementation series!

### After completing all prompts:
1. Update [00-index.md](./00-index.md) with all completion statuses
2. Run full test suite: `pnpm test`
3. Run lint: `pnpm lint`
4. Build production: `pnpm build`

---

## 📚 Reference

- [Service Documentation](../../02-services/33-service-help-desk.md)
- [API Review](../../api-review-docs/27-help-desk-review.html)
