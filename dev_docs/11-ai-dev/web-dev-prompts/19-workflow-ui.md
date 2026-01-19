# 19 - Workflow UI Implementation

> **Service:** Workflow (Business Process Automation)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 22  
> **Dependencies:** Foundation ✅, Auth API ✅, Workflow API ✅  
> **Doc Reference:** [26-service-workflow.md](../../02-services/26-service-workflow.md)

---

## 📋 Overview

The Workflow UI provides interfaces for managing automated business processes, approval workflows, task routing, and process monitoring. This includes workflow definitions, active instances, and task management.

### Key Screens
- Workflow dashboard
- Workflow templates
- Active workflows
- My tasks/inbox
- Task detail & actions
- Workflow history/audit

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Workflow API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── workflow/
│   ├── page.tsx                    # Workflow dashboard
│   ├── templates/
│   │   ├── page.tsx                # Workflow templates
│   │   ├── new/
│   │   │   └── page.tsx            # Create template
│   │   └── [id]/
│   │       ├── page.tsx            # Template detail
│   │       └── edit/
│   │           └── page.tsx        # Edit template
│   ├── instances/
│   │   ├── page.tsx                # Active workflows
│   │   └── [id]/
│   │       └── page.tsx            # Instance detail
│   ├── tasks/
│   │   ├── page.tsx                # My task inbox
│   │   └── [id]/
│   │       └── page.tsx            # Task detail
│   └── history/
│       └── page.tsx                # Workflow history
```

---

## 🎨 Components to Create

```
components/workflow/
├── workflow-dashboard-stats.tsx    # Dashboard metrics
├── active-workflows-chart.tsx      # Status chart
├── workflow-templates-table.tsx    # Templates list
├── workflow-template-card.tsx      # Template summary
├── workflow-template-form.tsx      # Create/edit template
├── workflow-step-editor.tsx        # Step configuration
├── condition-builder.tsx           # Condition setup
├── action-builder.tsx              # Action configuration
├── workflow-instances-table.tsx    # Active instances
├── instance-detail.tsx             # Instance view
├── instance-timeline.tsx           # Step progress
├── task-inbox.tsx                  # Task list
├── task-card.tsx                   # Task summary
├── task-detail.tsx                 # Full task view
├── task-action-buttons.tsx         # Approve/reject/etc
├── task-comment-form.tsx           # Add comments
├── task-reassign-form.tsx          # Reassign task
├── workflow-history-table.tsx      # Completed workflows
├── workflow-filters.tsx            # Filter controls
└── workflow-diagram.tsx            # Visual workflow
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/workflow.ts`

```typescript
export type WorkflowStatus = 
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type TaskStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type StepType = 
  | 'APPROVAL'
  | 'NOTIFICATION'
  | 'ACTION'
  | 'CONDITION'
  | 'PARALLEL'
  | 'DELAY';

export type TriggerType = 
  | 'MANUAL'
  | 'EVENT'
  | 'SCHEDULED'
  | 'API';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: number;
  
  // Trigger
  triggerType: TriggerType;
  triggerEvent?: string;
  triggerSchedule?: string;
  
  // Steps
  steps: WorkflowStep[];
  
  // Settings
  isActive: boolean;
  timeout?: number; // Hours
  
  // Stats
  instanceCount: number;
  avgCompletionTime?: number;
  
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  order: number;
  
  // Approval Config
  assigneeType?: 'USER' | 'ROLE' | 'DYNAMIC';
  assigneeId?: string;
  assigneeExpression?: string;
  
  // Conditions
  conditions?: WorkflowCondition[];
  
  // Actions
  actions?: WorkflowAction[];
  
  // Timeouts
  dueInHours?: number;
  escalateTo?: string;
  
  // Next steps
  nextStepId?: string;
  onRejectStepId?: string;
  parallelSteps?: string[];
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER' | 'LESS' | 'CONTAINS' | 'IN';
  value: unknown;
  nextStepId: string;
}

export interface WorkflowAction {
  id: string;
  type: 'UPDATE_FIELD' | 'SEND_EMAIL' | 'SEND_NOTIFICATION' | 'CALL_API' | 'CREATE_TASK';
  config: Record<string, unknown>;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  
  // Context
  entityType: string;
  entityId: string;
  entityName?: string;
  
  // Status
  status: WorkflowStatus;
  currentStepId?: string;
  currentStepName?: string;
  
  // Data
  data: Record<string, unknown>;
  
  // Timing
  startedAt: string;
  completedAt?: string;
  dueAt?: string;
  
  // Initiator
  initiatedById: string;
  initiatedByName: string;
  
  // History
  stepHistory: StepExecution[];
  
  createdAt: string;
}

export interface StepExecution {
  id: string;
  stepId: string;
  stepName: string;
  stepType: StepType;
  
  status: TaskStatus;
  
  // Assignee
  assigneeId?: string;
  assigneeName?: string;
  
  // Timing
  startedAt: string;
  completedAt?: string;
  
  // Result
  outcome?: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'SKIPPED';
  comments?: string;
  
  // Actions taken
  actionsTaken?: string[];
}

export interface WorkflowTask {
  id: string;
  instanceId: string;
  stepId: string;
  
  // Task Info
  title: string;
  description?: string;
  taskType: StepType;
  
  // Context
  entityType: string;
  entityId: string;
  entityName?: string;
  workflowName: string;
  
  // Assignment
  assigneeId: string;
  assigneeName: string;
  
  // Status
  status: TaskStatus;
  
  // Timing
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
  
  // Priority
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isOverdue: boolean;
  
  // Data
  formData?: Record<string, unknown>;
  
  // Actions available
  availableActions: string[];
  
  // Comments
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  
  content: string;
  
  authorId: string;
  authorName: string;
  
  createdAt: string;
}

export interface WorkflowDashboardData {
  // My Tasks
  myPendingTasks: number;
  myOverdueTasks: number;
  myCompletedToday: number;
  
  // Active Workflows
  activeWorkflows: number;
  workflowsByStatus: Array<{ status: WorkflowStatus; count: number }>;
  
  // Performance
  avgCompletionTime: number;
  onTimeRate: number;
  
  // Recent
  recentTasks: WorkflowTask[];
  recentInstances: WorkflowInstance[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/workflow/use-workflow.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowTask,
  WorkflowDashboardData,
} from '@/lib/types/workflow';
import { toast } from 'sonner';

export const workflowKeys = {
  all: ['workflow'] as const,
  dashboard: () => [...workflowKeys.all, 'dashboard'] as const,
  
  templates: () => [...workflowKeys.all, 'templates'] as const,
  templatesList: (params?: Record<string, unknown>) => [...workflowKeys.templates(), 'list', params] as const,
  templateDetail: (id: string) => [...workflowKeys.templates(), id] as const,
  
  instances: () => [...workflowKeys.all, 'instances'] as const,
  instancesList: (params?: Record<string, unknown>) => [...workflowKeys.instances(), 'list', params] as const,
  instanceDetail: (id: string) => [...workflowKeys.instances(), id] as const,
  
  tasks: () => [...workflowKeys.all, 'tasks'] as const,
  myTasks: (params?: Record<string, unknown>) => [...workflowKeys.tasks(), 'my', params] as const,
  taskDetail: (id: string) => [...workflowKeys.tasks(), id] as const,
  
  history: (params?: Record<string, unknown>) => [...workflowKeys.all, 'history', params] as const,
};

// Dashboard
export function useWorkflowDashboard() {
  return useQuery({
    queryKey: workflowKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: WorkflowDashboardData }>('/workflow/dashboard'),
  });
}

// Templates
export function useWorkflowTemplates(params = {}) {
  return useQuery({
    queryKey: workflowKeys.templatesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<WorkflowTemplate>>('/workflow/templates', params),
  });
}

export function useWorkflowTemplate(id: string) {
  return useQuery({
    queryKey: workflowKeys.templateDetail(id),
    queryFn: () => apiClient.get<{ data: WorkflowTemplate }>(`/workflow/templates/${id}`),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WorkflowTemplate>) =>
      apiClient.post<{ data: WorkflowTemplate }>('/workflow/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.templates() });
      toast.success('Template created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowTemplate> }) =>
      apiClient.patch<{ data: WorkflowTemplate }>(`/workflow/templates/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.templateDetail(id) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.templates() });
      toast.success('Template updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

export function useToggleTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/workflow/templates/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.templates() });
      toast.success('Template status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle template');
    },
  });
}

// Instances
export function useWorkflowInstances(params = {}) {
  return useQuery({
    queryKey: workflowKeys.instancesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<WorkflowInstance>>('/workflow/instances', params),
  });
}

export function useWorkflowInstance(id: string) {
  return useQuery({
    queryKey: workflowKeys.instanceDetail(id),
    queryFn: () => apiClient.get<{ data: WorkflowInstance }>(`/workflow/instances/${id}`),
    enabled: !!id,
  });
}

export function useStartWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, entityType, entityId, data }: { 
      templateId: string; 
      entityType: string;
      entityId: string;
      data?: Record<string, unknown>;
    }) =>
      apiClient.post<{ data: WorkflowInstance }>('/workflow/instances/start', { 
        templateId, 
        entityType, 
        entityId, 
        data 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.instances() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.dashboard() });
      toast.success('Workflow started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start workflow');
    },
  });
}

export function useCancelWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/workflow/instances/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.instances() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.tasks() });
      toast.success('Workflow cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel workflow');
    },
  });
}

// Tasks
export function useMyTasks(params = {}) {
  return useQuery({
    queryKey: workflowKeys.myTasks(params),
    queryFn: () => apiClient.get<PaginatedResponse<WorkflowTask>>('/workflow/tasks/my', params),
  });
}

export function useWorkflowTask(id: string) {
  return useQuery({
    queryKey: workflowKeys.taskDetail(id),
    queryFn: () => apiClient.get<{ data: WorkflowTask }>(`/workflow/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action, comments, formData }: { 
      id: string; 
      action: string;
      comments?: string;
      formData?: Record<string, unknown>;
    }) =>
      apiClient.post(`/workflow/tasks/${id}/complete`, { action, comments, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.instances() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.dashboard() });
      toast.success('Task completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete task');
    },
  });
}

export function useReassignTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assigneeId, reason }: { id: string; assigneeId: string; reason?: string }) =>
      apiClient.post(`/workflow/tasks/${id}/reassign`, { assigneeId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.tasks() });
      toast.success('Task reassigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reassign task');
    },
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      apiClient.post(`/workflow/tasks/${taskId}/comments`, { content }),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.taskDetail(taskId) });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

// History
export function useWorkflowHistory(params = {}) {
  return useQuery({
    queryKey: workflowKeys.history(params),
    queryFn: () => apiClient.get<PaginatedResponse<WorkflowInstance>>('/workflow/history', params),
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/workflow-store.ts`

```typescript
import { createStore } from './create-store';
import { WorkflowStatus, TaskStatus } from '@/lib/types/workflow';

interface WorkflowFilters {
  search: string;
  templateId: string;
  instanceStatus: WorkflowStatus | '';
  taskStatus: TaskStatus | '';
  priority: string;
  overdueOnly: boolean;
}

interface WorkflowState {
  filters: WorkflowFilters;
  selectedTemplateId: string | null;
  selectedInstanceId: string | null;
  selectedTaskId: string | null;
  isTemplateDialogOpen: boolean;
  isStartDialogOpen: boolean;
  isTaskDialogOpen: boolean;
  
  setFilter: <K extends keyof WorkflowFilters>(key: K, value: WorkflowFilters[K]) => void;
  resetFilters: () => void;
  setSelectedTemplate: (id: string | null) => void;
  setSelectedInstance: (id: string | null) => void;
  setSelectedTask: (id: string | null) => void;
  setTemplateDialogOpen: (open: boolean) => void;
  setStartDialogOpen: (open: boolean) => void;
  setTaskDialogOpen: (open: boolean) => void;
}

const defaultFilters: WorkflowFilters = {
  search: '',
  templateId: '',
  instanceStatus: '',
  taskStatus: '',
  priority: '',
  overdueOnly: false,
};

export const useWorkflowStore = createStore<WorkflowState>('workflow-store', (set, get) => ({
  filters: defaultFilters,
  selectedTemplateId: null,
  selectedInstanceId: null,
  selectedTaskId: null,
  isTemplateDialogOpen: false,
  isStartDialogOpen: false,
  isTaskDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
  
  setSelectedInstance: (id) => set({ selectedInstanceId: id }),
  
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  
  setTemplateDialogOpen: (open) => set({ isTemplateDialogOpen: open }),
  
  setStartDialogOpen: (open) => set({ isStartDialogOpen: open }),
  
  setTaskDialogOpen: (open) => set({ isTaskDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/workflow.ts`

```typescript
import { z } from 'zod';

const workflowConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER', 'LESS', 'CONTAINS', 'IN']),
  value: z.unknown(),
  nextStepId: z.string().min(1),
});

const workflowActionSchema = z.object({
  type: z.enum(['UPDATE_FIELD', 'SEND_EMAIL', 'SEND_NOTIFICATION', 'CALL_API', 'CREATE_TASK']),
  config: z.record(z.unknown()),
});

const workflowStepSchema = z.object({
  name: z.string().min(1, 'Step name is required'),
  type: z.enum(['APPROVAL', 'NOTIFICATION', 'ACTION', 'CONDITION', 'PARALLEL', 'DELAY']),
  order: z.number().int().min(0),
  assigneeType: z.enum(['USER', 'ROLE', 'DYNAMIC']).optional(),
  assigneeId: z.string().optional(),
  assigneeExpression: z.string().optional(),
  conditions: z.array(workflowConditionSchema).optional(),
  actions: z.array(workflowActionSchema).optional(),
  dueInHours: z.number().positive().optional(),
  escalateTo: z.string().optional(),
  nextStepId: z.string().optional(),
  onRejectStepId: z.string().optional(),
});

export const workflowTemplateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  triggerType: z.enum(['MANUAL', 'EVENT', 'SCHEDULED', 'API']),
  triggerEvent: z.string().optional(),
  triggerSchedule: z.string().optional(),
  steps: z.array(workflowStepSchema).min(1, 'At least one step is required'),
  timeout: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export const startWorkflowSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity is required'),
  data: z.record(z.unknown()).optional(),
});

export const completeTaskSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  comments: z.string().optional(),
  formData: z.record(z.unknown()).optional(),
});

export const reassignTaskSchema = z.object({
  assigneeId: z.string().min(1, 'Assignee is required'),
  reason: z.string().optional(),
});

export const taskCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
});

export type WorkflowTemplateFormData = z.infer<typeof workflowTemplateFormSchema>;
export type StartWorkflowData = z.infer<typeof startWorkflowSchema>;
export type CompleteTaskData = z.infer<typeof completeTaskSchema>;
export type ReassignTaskData = z.infer<typeof reassignTaskSchema>;
export type TaskCommentData = z.infer<typeof taskCommentSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/workflow/workflow-dashboard-stats.tsx`
- [ ] `components/workflow/active-workflows-chart.tsx`
- [ ] `components/workflow/workflow-templates-table.tsx`
- [ ] `components/workflow/workflow-template-card.tsx`
- [ ] `components/workflow/workflow-template-form.tsx`
- [ ] `components/workflow/workflow-step-editor.tsx`
- [ ] `components/workflow/condition-builder.tsx`
- [ ] `components/workflow/action-builder.tsx`
- [ ] `components/workflow/workflow-instances-table.tsx`
- [ ] `components/workflow/instance-detail.tsx`
- [ ] `components/workflow/instance-timeline.tsx`
- [ ] `components/workflow/task-inbox.tsx`
- [ ] `components/workflow/task-card.tsx`
- [ ] `components/workflow/task-detail.tsx`
- [ ] `components/workflow/task-action-buttons.tsx`
- [ ] `components/workflow/task-comment-form.tsx`
- [ ] `components/workflow/task-reassign-form.tsx`
- [ ] `components/workflow/workflow-history-table.tsx`
- [ ] `components/workflow/workflow-filters.tsx`
- [ ] `components/workflow/workflow-diagram.tsx`

### Pages
- [ ] `app/(dashboard)/workflow/page.tsx`
- [ ] `app/(dashboard)/workflow/templates/page.tsx`
- [ ] `app/(dashboard)/workflow/templates/new/page.tsx`
- [ ] `app/(dashboard)/workflow/templates/[id]/page.tsx`
- [ ] `app/(dashboard)/workflow/templates/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/workflow/instances/page.tsx`
- [ ] `app/(dashboard)/workflow/instances/[id]/page.tsx`
- [ ] `app/(dashboard)/workflow/tasks/page.tsx`
- [ ] `app/(dashboard)/workflow/tasks/[id]/page.tsx`
- [ ] `app/(dashboard)/workflow/history/page.tsx`

### Hooks & Stores
- [ ] `lib/types/workflow.ts`
- [ ] `lib/validations/workflow.ts`
- [ ] `lib/hooks/workflow/use-workflow.ts`
- [ ] `lib/stores/workflow-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [20-integration-hub-ui.md](./20-integration-hub-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/26-service-workflow.md)
- [API Review](../../api-review-docs/19-workflow-review.html)
