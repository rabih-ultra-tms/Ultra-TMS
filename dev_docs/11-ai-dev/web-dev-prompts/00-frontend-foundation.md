# 00 - Frontend Foundation Setup

> **Scope:** Foundation infrastructure for all frontend development  
> **Priority:** P0 - Must complete before any service UI  
> **Time Estimate:** 2-3 hours  
> **Doc Reference:** [68-frontend-architecture-standards.md](../../08-standards/68-frontend-architecture-standards.md)

---

## 📋 Overview

This prompt sets up the foundational infrastructure required for all frontend development, including:

- Package installations (React Query, Zustand, testing libraries)
- Provider setup (QueryClientProvider, theme provider)
- Shared UI components (PageHeader, ErrorState, EmptyState, etc.)
- Custom hooks (useApi, usePagination, useDebounce)
- Jest + MSW testing setup (ESM-compatible)
- SSR-safe API client with HTTP-only cookie auth
- Auth middleware for protected routes

---

## 🔖 Version Alignment

This plan aligns with the **existing** `apps/web/package.json` versions:

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.1.0 | Installed in workspace |
| React | 19.2.0 | Installed in workspace |
| Tailwind CSS | 4.1.18 | Installed in workspace |
| Zod | 4.3.5 | Installed in workspace |
| react-hook-form | 7.70.0 | Installed in workspace |
| @tanstack/react-table | 8.21.3 | Installed in workspace |

**Note:** If npm registry shows versions unavailable, these are internal/private registry versions. Use `^` prefix for flexible resolution (e.g., `^19.0.0` for React).

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] `apps/web` is the current working directory
- [ ] Node.js 20+ is installed
- [ ] pnpm is available
- [ ] Backend API is running or mocked
- [ ] Existing UI components work (Button, Card, Input, etc.)
- [ ] `apps/web/package.json` has `"type": "module"` (ESM mode)

---

## 📦 Step 1: Install Required Packages

### Production Dependencies

```bash
cd apps/web

# State Management & Data Fetching
pnpm add @tanstack/react-query zustand

# Utilities
pnpm add lucide-react date-fns

# Additional Radix primitives (if not already installed)
pnpm add @radix-ui/react-alert-dialog @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-toast @radix-ui/react-scroll-area
```

### Development Dependencies

```bash
# Testing (ESM-compatible)
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-node ts-jest

# React Query Devtools (for development debugging)
pnpm add -D @tanstack/react-query-devtools

# API Mocking
pnpm add -D msw
```

### Update package.json Scripts

Add the following scripts to `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit",
    "test": "NODE_OPTIONS='--experimental-vm-modules' jest",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules' jest --watch",
    "test:coverage": "NODE_OPTIONS='--experimental-vm-modules' jest --coverage"
  }
}
```

### shadcn/ui Components

**Important:** shadcn must be initialized before adding components. The existing `apps/web` already has some UI components but may need shadcn configuration.

```bash
# Step 1: Initialize shadcn (if not already done)
# This creates components.json and sets up paths
npx shadcn@latest init

# When prompted, select:
# - Style: Default
# - Base color: Slate (or match existing)
# - CSS variables: Yes
# - tailwind.config location: tailwind.config.ts
# - Components location: components/ui
# - Utils location: lib/utils.ts

# Step 2: Add required components
npx shadcn@latest add toast
npx shadcn@latest add sonner
npx shadcn@latest add skeleton
npx shadcn@latest add alert-dialog
npx shadcn@latest add sheet
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add tooltip
npx shadcn@latest add avatar
npx shadcn@latest add progress
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
```

### Verify shadcn Configuration

After initialization, verify `apps/web/components.json` exists:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 🎨 Step 1b: Design System Alignment

### Workspace UI Package (@repo/ui)

The workspace includes a shared UI package at `packages/ui`. The `apps/web` app imports from this via `@repo/ui`.

**Guidelines:**
1. **Prefer @repo/ui components** when available for consistency across apps
2. **Use local shadcn components** for app-specific UI not in @repo/ui
3. **Don't duplicate** - if a component exists in @repo/ui, don't recreate it locally

### Tailwind Configuration Alignment

The existing `apps/web/tailwind.config.ts` already has the correct theme setup. **Do not override** the following:

```typescript
// These are already configured - DO NOT CHANGE
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: { ... },
      secondary: { ... },
      destructive: { ... },
      muted: { ... },
      accent: { ... },
      popover: { ... },
      card: { ... },
    },
    borderRadius: { ... },
  },
}
```

### Existing Components in apps/web

The following components already exist in `apps/web/components/ui/`. **Do not overwrite** unless explicitly updating:

| Component | File | Status |
|-----------|------|--------|
| Badge | Badge.tsx | ✅ Exists |
| Button | Button.tsx | ✅ Exists |
| Card | Card.tsx | ✅ Exists |
| Checkbox | checkbox.tsx | ✅ Exists |
| Form | form.tsx | ✅ Exists |
| Input | Input.tsx | ✅ Exists |
| Label | label.tsx | ✅ Exists |
| PageHeader | PageHeader.tsx | ✅ Exists |
| Pagination | Pagination.tsx | ✅ Exists |
| Switch | switch.tsx | ✅ Exists |

When running `npx shadcn@latest add <component>`, shadcn will prompt before overwriting. **Select "No"** for components that already exist unless you want to update them.

### Import Conventions

```typescript
// Local UI components (shadcn-based + existing components)
import { Button, Card, Input, PageHeader } from '@/components/ui';

// Shared workspace components (if using @repo/ui)
import { SomeSharedComponent } from '@repo/ui';

// Custom shared components (this project)
import { ErrorState, LoadingState, EmptyState } from '@/components/shared';
```
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 🏗️ Step 2: Create Provider Setup

### File: `app/providers.tsx`

```typescript
'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

/**
 * Lazy-load React Query Devtools to avoid including in production bundle
 * This is a devDependency, so we must lazy-load to prevent build errors
 */
const ReactQueryDevtools = React.lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

/**
 * Global error handler for React Query
 * Handles 401 errors globally and shows toast notifications
 */
function handleQueryError(error: unknown) {
  if (error instanceof ApiError) {
    // Handle 401 Unauthorized - redirect to login
    if (error.status === 401) {
      // Clear any stale auth state
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      return;
    }
    
    // Handle 403 Forbidden
    if (error.status === 403) {
      toast.error('Access Denied', { description: 'You do not have permission to perform this action.' });
      return;
    }
    
    // Handle validation errors (422)
    if (error.status === 422 && error.errors) {
      const messages = Object.values(error.errors).flat().join(', ');
      toast.error('Validation Error', { description: messages });
      return;
    }
  }
  
  // Generic error toast
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast.error('Error', { description: message });
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleQueryError,
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        // Enable suspense and error boundaries when using Suspense pattern
        // Uncomment these for pages using React Suspense:
        // suspense: true,
        // useErrorBoundary: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
      {process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </React.Suspense>
      )}
    </QueryClientProvider>
  );
}

/**
 * Query key factory pattern for consistent key generation
 * Use this pattern in all service hooks
 */
export const queryKeys = {
  // Example pattern - each service should define its own
  all: (service: string) => [service] as const,
  lists: (service: string) => [...queryKeys.all(service), 'list'] as const,
  list: (service: string, params: Record<string, unknown>) => [...queryKeys.lists(service), params] as const,
  details: (service: string) => [...queryKeys.all(service), 'detail'] as const,
  detail: (service: string, id: string) => [...queryKeys.details(service), id] as const,
};
```

### Update: `app/layout.tsx`

Wrap the application with providers:

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🎨 Step 3: Create Shared Components

> **Note:** `PageHeader` already exists at `components/ui/PageHeader.tsx`. We will **NOT** create a duplicate. Use the existing component for all pages.

### Existing PageHeader Usage

The existing `PageHeader` in `components/ui/PageHeader.tsx` supports:

```typescript
import PageHeader from '@/components/ui/PageHeader';

// Basic usage
<PageHeader title="Carriers" />

// With subtitle (also accepts `description` alias)
<PageHeader title="Carriers" subtitle="Manage your carrier network" />

// With actions (also accepts `children` alias)
<PageHeader 
  title="Carriers" 
  description="Manage your carrier network"
  actions={<Button>Add Carrier</Button>}
/>
```

**Do NOT create** `components/shared/page-header.tsx` - use `components/ui/PageHeader` instead.

### File: `components/shared/error-state.tsx`

```typescript
import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  backButton?: React.ReactNode;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  backButton 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      <div className="flex gap-4">
        {backButton}
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
```

### File: `components/shared/empty-state.tsx`

```typescript
import * as React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {icon || <Inbox className="h-12 w-12 text-muted-foreground mb-4" />}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
```

### File: `components/shared/loading-state.tsx`

```typescript
import * as React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      {message && (
        <p className="text-muted-foreground mt-4">{message}</p>
      )}
    </div>
  );
}
```

### File: `components/shared/confirm-dialog.tsx`

```typescript
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### File: `components/shared/data-table-skeleton.tsx`

```typescript
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
}

export function DataTableSkeleton({ columns, rows = 10 }: DataTableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### File: `components/shared/index.ts`

```typescript
// NOTE: PageHeader is in components/ui/PageHeader.tsx - use that instead
export { ErrorState } from './error-state';
export { EmptyState } from './empty-state';
export { LoadingState } from './loading-state';
export { ConfirmDialog } from './confirm-dialog';
export { DataTableSkeleton } from './data-table-skeleton';
```

---

## 🪝 Step 4: Create Custom Hooks

### File: `lib/hooks/use-debounce.ts`

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### File: `lib/hooks/use-pagination.ts`

```typescript
import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface PaginationState {
  page: number;
  limit: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 20 } = options;
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination({ page: 1, limit }); // Reset to page 1 when limit changes
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const reset = useCallback(() => {
    setPagination({ page: initialPage, limit: initialLimit });
  }, [initialPage, initialLimit]);

  return {
    ...pagination,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
  };
}
```

### File: `lib/hooks/use-confirm.ts`

```typescript
import { useState, useCallback } from 'react';

interface UseConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: UseConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
  }, [resolveRef]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    setIsOpen,
  };
}
```

### File: `lib/hooks/index.ts`

```typescript
export { useDebounce } from './use-debounce';
export { usePagination } from './use-pagination';
export { useConfirm } from './use-confirm';
```

---

## 🌐 Step 5: Create SSR-Safe API Client

The API client must work in both Server Components (SSR) and Client Components. For SSR, we use HTTP-only cookies set by the backend. For client-side, cookies are automatically sent with `credentials: 'include'`.

### File: `lib/api/client.ts`

```typescript
/**
 * SSR-safe API Client
 * 
 * Authentication Strategy:
 * - HTTP-only cookies are set by the backend on login
 * - Cookies are automatically sent with credentials: 'include'
 * - For Server Components, cookies are forwarded via Next.js headers
 * - NO localStorage usage (XSS-safe)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Structured API Error with full response details
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;
  public readonly errors?: Record<string, string[]>;
  public readonly code?: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    body?: unknown,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.errors = errors;
    this.code = code;
  }

  /**
   * Check if error is a specific HTTP status
   */
  isStatus(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is a validation error (422)
   */
  isValidationError(): boolean {
    return this.status === 422;
  }

  /**
   * Check if error is unauthorized (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is forbidden (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /**
   * For Server Components: pass cookies from Next.js headers
   * Example: cookies().toString()
   */
  serverCookies?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the full URL for an endpoint
   * Ensures MSW can intercept with absolute URLs
   */
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { body, serverCookies, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // For Server Components, forward cookies from Next.js
    if (serverCookies) {
      (headers as Record<string, string>)['Cookie'] = serverCookies;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // Include cookies for cross-origin requests (auth)
      credentials: 'include',
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorBody: unknown;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errors: Record<string, string[]> | undefined;
      let code: string | undefined;

      try {
        errorBody = await response.json();
        if (typeof errorBody === 'object' && errorBody !== null) {
          const body = errorBody as Record<string, unknown>;
          errorMessage = (body.message as string) || errorMessage;
          errors = body.errors as Record<string, string[]>;
          code = body.code as string;
        }
      } catch {
        // Response wasn't JSON
      }

      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText,
        errorBody,
        errors,
        code
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload files with multipart/form-data
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { serverCookies, ...fetchOptions } = options || {};

    const headers: HeadersInit = {
      // Don't set Content-Type - browser sets it with boundary
      ...(options?.headers as Record<string, string>),
    };

    if (serverCookies) {
      (headers as Record<string, string>)['Cookie'] = serverCookies;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        // Response wasn't JSON
      }
      const message = (errorBody as { message?: string })?.message || response.statusText;
      throw new ApiError(message, response.status, response.statusText, errorBody);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, PaginatedResponse };

/**
 * Helper for Server Components to get cookies
 * 
 * Usage in Server Component:
 * ```
 * import { cookies } from 'next/headers';
 * const data = await apiClient.get('/endpoint', {}, { 
 *   serverCookies: cookies().toString() 
 * });
 * ```
 */
export function getServerCookies(): string {
  // This is a placeholder - actual implementation uses next/headers
  // which must be called in a Server Component context
  throw new Error('getServerCookies must be called in a Server Component. Use: cookies().toString()');
}
```

### File: `lib/api/index.ts`

```typescript
export { apiClient, ApiError, getServerCookies } from './client';
export type { ApiResponse, PaginatedResponse } from './client';
```

---

## 🔒 Step 5b: Create Auth Middleware

For protected routes, create middleware that checks auth cookies.

### Cookie Strategy & Security

**Cookie Types Used:**

| Cookie | Type | Purpose | Set By |
|--------|------|---------|--------|
| `accessToken` | HTTP-only, Secure, SameSite=Lax | JWT auth token | Backend on login |
| `refreshToken` | HTTP-only, Secure, SameSite=Strict | Token refresh | Backend on login |
| `csrfToken` | Readable by JS, Secure, SameSite=Strict | CSRF protection | Backend on login |

**Why HTTP-only cookies?**
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests via `credentials: 'include'`
- Backend validates tokens, not the frontend

**CSRF Protection:**
- Backend should set `SameSite=Lax` or `SameSite=Strict` on auth cookies
- For state-changing requests (POST/PUT/DELETE), backend should:
  - Require a CSRF token in headers OR
  - Verify `Origin`/`Referer` headers match allowed origins
- The API client sends `credentials: 'include'` which sends cookies automatically

### Configuration File

Create a config file to centralize auth-related settings:

### File: `lib/config/auth.ts`

```typescript
/**
 * Auth configuration - update these to match your backend
 */
export const AUTH_CONFIG = {
  /**
   * Cookie name for the access token
   * Must match what the backend sets on login
   */
  accessTokenCookie: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'accessToken',
  
  /**
   * Cookie name for CSRF token (if using CSRF protection)
   */
  csrfTokenCookie: process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME || 'csrfToken',
  
  /**
   * CSRF header name to send with state-changing requests
   */
  csrfHeaderName: 'X-CSRF-Token',
  
  /**
   * Routes that don't require authentication
   */
  publicPaths: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api/health',
  ],
  
  /**
   * Where to redirect unauthenticated users
   */
  loginPath: '/login',
  
  /**
   * Where to redirect after successful login (default)
   */
  defaultRedirect: '/dashboard',
} as const;
```

### File: `middleware.ts` (root of apps/web)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './lib/config/auth';

/**
 * Routes that are always public (static assets, etc.)
 */
const alwaysPublicPatterns = [
  /^\/_next/,
  /^\/favicon/,
  /^\/public/,
  /\.(ico|png|jpg|jpeg|svg|css|js)$/,
];

function isPublicPath(pathname: string): boolean {
  // Check always public patterns
  if (alwaysPublicPatterns.some(pattern => pattern.test(pathname))) {
    return true;
  }
  
  // Check configured public paths
  return AUTH_CONFIG.publicPaths.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check for auth cookie using configured name
  const authToken = request.cookies.get(AUTH_CONFIG.accessTokenCookie);
  
  if (!authToken) {
    // Redirect to login with return URL
    const loginUrl = new URL(AUTH_CONFIG.loginPath, request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Token exists, allow request
  // Note: Token validation happens on the API server
  // The middleware only checks for cookie presence, not validity
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Auth Hook for Client Components

### File: `lib/hooks/use-auth.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api';
import { AUTH_CONFIG } from '@/lib/config/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: User;
  };
}

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Get current authenticated user
 * Uses HTTP-only cookie for auth
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<AuthResponse>('/auth/me');
      return response.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Login mutation
 * Backend sets HTTP-only cookie on success
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
      toast.success('Welcome back!', { description: `Logged in as ${user.email}` });
      router.push(AUTH_CONFIG.defaultRedirect);
    },
    onError: (error: Error) => {
      if (error instanceof ApiError && error.status === 401) {
        toast.error('Invalid credentials', { description: 'Please check your email and password.' });
      }
    },
  });
}

/**
 * Logout mutation
 * Clears HTTP-only cookie on backend
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      router.push(AUTH_CONFIG.loginPath);
    },
    onSettled: () => {
      // Always clear queries even if logout fails
      queryClient.clear();
    },
  });
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { data: user } = useCurrentUser();
  return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified roles
 */
export function useHasRole(roles: string | string[]): boolean {
  const { data: user } = useCurrentUser();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return user ? roleArray.includes(user.role) : false;
}
```

---

## 🗄️ Step 6: Create Zustand Store Pattern

### File: `lib/stores/create-store.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Helper to create stores with devtools in development
export function createStore<T extends object>(
  name: string,
  initializer: (set: (state: Partial<T>) => void, get: () => T) => T
) {
  return create<T>()(
    devtools(
      (set, get) => initializer((state) => set(state as Partial<T>), get),
      { name }
    )
  );
}
```

### File: `lib/stores/ui-store.ts` (Global UI state example)

```typescript
import { createStore } from './create-store';

interface UIState {
  sidebarOpen: boolean;
  commandMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandMenu: () => void;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUIStore = createStore<UIState>('ui-store', (set, get) => ({
  sidebarOpen: true,
  commandMenuOpen: false,
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandMenu: () => set({ commandMenuOpen: !get().commandMenuOpen }),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
}));
```

### File: `lib/stores/index.ts`

```typescript
export { createStore } from './create-store';
export { useUIStore } from './ui-store';
```

---

## 🧪 Step 7: Configure Jest Testing (ESM-Compatible)

The `apps/web` package uses `"type": "module"` (ESM). Jest requires special configuration for ESM modules.

### File: `jest.config.ts`

```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  
  // Setup files run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // Module path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/**/*.test.{ts,tsx}',
    '<rootDir>/**/*.spec.{ts,tsx}',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  
  // Transform ESM modules that Jest doesn't handle by default
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules)/)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Use node experimental VM modules for ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Workaround for ESM in Jest
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default createJestConfig(config);
```

### File: `test/setup.ts`

```typescript
import '@testing-library/jest-dom';

// Import MSW server - using dynamic import for ESM compatibility
let server: ReturnType<typeof import('msw/node')['setupServer']> | null = null;

beforeAll(async () => {
  // Dynamic import for ESM
  const { server: mswServer } = await import('./mocks/server');
  server = mswServer;
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server?.resetHandlers();
});

afterAll(() => {
  server?.close();
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/headers for Server Component tests
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    toString: () => '',
  }),
  headers: () => new Headers(),
}));

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress specific React/Next warnings if needed
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### File: `test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers/index.js';

export const server = setupServer(...handlers);
```

### File: `test/mocks/handlers/index.ts`

```typescript
import { http, HttpResponse } from 'msw';

/**
 * API Base URL - MUST match the client's base URL for MSW to intercept
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Helper to create full API URLs
 */
function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// Base handlers - add service-specific handlers as you implement
export const handlers = [
  // Health check
  http.get(apiUrl('/health'), () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Auth: Get current user
  http.get(apiUrl('/auth/me'), () => {
    return HttpResponse.json({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
          permissions: ['read:users', 'write:users'],
        },
      },
    });
  }),

  // Auth: Login
  http.post(apiUrl('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(
        {
          data: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'ADMIN',
              permissions: ['read:users', 'write:users'],
            },
          },
        },
        {
          headers: {
            'Set-Cookie': 'accessToken=mock-token; HttpOnly; Path=/',
          },
        }
      );
    }

    return HttpResponse.json(
      { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }),

  // Auth: Logout
  http.post(apiUrl('/auth/logout'), () => {
    return HttpResponse.json(
      { message: 'Logged out' },
      {
        headers: {
          'Set-Cookie': 'accessToken=; HttpOnly; Path=/; Max-Age=0',
        },
      }
    );
  }),
];

/**
 * Export helper for creating API URLs in service-specific handlers
 */
export { apiUrl };
```

### File: `test/mocks/handlers.ts`

```typescript
// Re-export all handlers from the handlers directory
export { handlers, apiUrl } from './handlers/index.js';
```

### File: `test/utils.tsx`

```typescript
import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

function createWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: createWrapper(), ...options });
}

/**
 * Wait for React Query to settle (useful for async tests)
 */
export function waitForQueryToSettle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

### Update: `package.json` scripts

Ensure `apps/web/package.json` has the following scripts:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit",
    "test": "NODE_OPTIONS='--experimental-vm-modules' jest",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules' jest --watch",
    "test:coverage": "NODE_OPTIONS='--experimental-vm-modules' jest --coverage"
  }
}
```

**Windows Users:** For PowerShell, use:

```json
{
  "scripts": {
    "test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:coverage": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --coverage"
  }
}
```

Install cross-env: `pnpm add -D cross-env`

---

## 📁 Step 8: Folder Structure Verification

After completing all steps, verify your folder structure:

```
apps/web/
├── app/
│   ├── layout.tsx          # Updated with Providers
│   ├── providers.tsx        # NEW: React Query + Toast provider + error handling
│   ├── globals.css          # Updated by shadcn init
│   ├── (auth)/
│   └── (dashboard)/
├── components/
│   ├── shared/              # NEW: Shared components
│   │   ├── index.ts
│   │   ├── error-state.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-state.tsx
│   │   ├── confirm-dialog.tsx
│   │   └── data-table-skeleton.tsx
│   └── ui/                  # shadcn components (existing + new)
│       ├── button.tsx       # Existing
│       ├── card.tsx         # Existing
│       ├── PageHeader.tsx   # Existing - USE THIS, don't create new
│       ├── toast.tsx        # NEW via shadcn
│       ├── sonner.tsx       # NEW via shadcn
│       ├── skeleton.tsx     # NEW via shadcn
│       ├── alert-dialog.tsx # NEW via shadcn
│       ├── command.tsx      # NEW via shadcn
│       └── ... (other shadcn components)
├── lib/
│   ├── api/                 # NEW: SSR-safe API client
│   │   ├── index.ts
│   │   └── client.ts        # With ApiError class
│   ├── config/              # NEW: Configuration
│   │   └── auth.ts          # Auth configuration (cookie names, paths)
│   ├── hooks/               # NEW: Custom hooks
│   │   ├── index.ts
│   │   ├── use-debounce.ts
│   │   ├── use-pagination.ts
│   │   ├── use-confirm.ts
│   │   └── use-auth.ts      # NEW: Auth hooks
│   ├── stores/              # NEW: Zustand stores
│   │   ├── index.ts
│   │   ├── create-store.ts
│   │   └── ui-store.ts
│   └── utils.ts             # Existing utilities
├── test/                    # NEW: Test utilities (ESM-compatible)
│   ├── setup.ts
│   ├── utils.tsx
│   └── mocks/
│       ├── server.ts
│       ├── handlers.ts
│       └── handlers/
│           └── index.ts     # With absolute API URLs
├── middleware.ts            # NEW: Auth middleware
├── components.json          # NEW: shadcn configuration
├── jest.config.ts           # NEW: Jest configuration (ESM)
└── package.json             # Updated with test scripts
```

---

## ✅ Completion Checklist

### Package Installation
- [ ] All packages installed (React Query, Zustand, Lucide, date-fns)
- [ ] React Query devtools installed (`@tanstack/react-query-devtools`) as devDependency
- [ ] Testing packages installed (jest, @testing-library/*, msw)
- [ ] cross-env installed for Windows compatibility

### shadcn Configuration
- [ ] `components.json` created via `npx shadcn@latest init`
- [ ] shadcn components added (toast, sonner, skeleton, alert-dialog, etc.)
- [ ] Existing components not overwritten (Button, Card, Input, PageHeader)

### Providers & Auth
- [ ] `app/providers.tsx` created with:
  - [ ] QueryClientProvider with error handling
  - [ ] Global error handler for 401/403/422
  - [ ] React Query Devtools (dev only)
- [ ] `app/layout.tsx` updated to use Providers
- [ ] `middleware.ts` created for auth protection
- [ ] `lib/hooks/use-auth.ts` created for auth hooks

### API Client
- [ ] `lib/api/client.ts` created with:
  - [ ] SSR-safe implementation (no localStorage)
  - [ ] HTTP-only cookie auth via `credentials: 'include'`
  - [ ] `ApiError` class with status, body, errors
  - [ ] Server Component support via `serverCookies` option
- [ ] `lib/api/index.ts` exports ApiError and types

### Shared Components
- [ ] Shared components created (PageHeader, ErrorState, EmptyState, etc.)

### Custom Hooks
- [ ] Custom hooks created (useDebounce, usePagination, useConfirm)
- [ ] Auth hooks created (useCurrentUser, useLogin, useLogout)

### Zustand Stores
- [ ] Store pattern created (`lib/stores/create-store.ts`)
- [ ] UI store example created

### Testing Configuration
- [ ] `jest.config.ts` created (ESM-compatible)
- [ ] `test/setup.ts` with ESM dynamic imports
- [ ] MSW handlers using absolute API URLs
- [ ] Test scripts added to package.json
- [ ] Run `pnpm test` to verify setup works

### Validation
- [ ] Run `pnpm check-types` to verify no type errors
- [ ] Run `pnpm lint` to verify no lint errors
- [ ] Run `pnpm test` to verify tests pass

---

## 🧪 Verification Tests

### File: `components/ui/PageHeader.test.tsx`

Test the **existing** PageHeader component (do not create a new one):

```typescript
import { render, screen } from '@/test/utils';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Title" description="Test description" />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader 
        title="Title" 
        actions={<button>Action</button>} 
      />
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
```

### File: `components/shared/error-state.test.tsx`

```typescript
import { render, screen } from '@/test/utils';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
```

### File: `lib/hooks/use-debounce.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });
});
```

### File: `lib/api/client.test.ts`

```typescript
import { apiClient, ApiError } from './client';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

describe('ApiClient', () => {
  it('makes GET requests', async () => {
    const data = await apiClient.get<{ status: string }>('/health');
    expect(data).toEqual({ status: 'ok' });
  });

  it('throws ApiError with status on failure', async () => {
    server.use(
      http.get(`${API_BASE}/error`, () => {
        return HttpResponse.json(
          { message: 'Not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      })
    );

    await expect(apiClient.get('/error')).rejects.toThrow(ApiError);
    
    try {
      await apiClient.get('/error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).code).toBe('NOT_FOUND');
    }
  });

  it('includes validation errors on 422', async () => {
    server.use(
      http.post(`${API_BASE}/validate`, () => {
        return HttpResponse.json(
          { 
            message: 'Validation failed',
            errors: { email: ['Invalid email format'] }
          },
          { status: 422 }
        );
      })
    );

    try {
      await apiClient.post('/validate', { email: 'bad' });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).isValidationError()).toBe(true);
      expect((error as ApiError).errors?.email).toContain('Invalid email format');
    }
  });
});
```

---

## 📋 React Query Best Practices

### Query Key Conventions

Use the factory pattern from `providers.tsx` for consistent keys:

```typescript
// Service-specific key factory
export const carrierKeys = {
  all: ['carriers'] as const,
  lists: () => [...carrierKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...carrierKeys.lists(), params] as const,
  details: () => [...carrierKeys.all, 'detail'] as const,
  detail: (id: string) => [...carrierKeys.details(), id] as const,
};
```

### Using Suspense and Error Boundaries

For pages that use React Suspense:

```typescript
// In your page component
export default function CarriersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ErrorBoundary fallback={<ErrorState message="Failed to load carriers" />}>
        <CarriersList />
      </ErrorBoundary>
    </Suspense>
  );
}

// In your hook
const { data } = useSuspenseQuery({
  queryKey: carrierKeys.list(params),
  queryFn: () => apiClient.get('/carriers', params),
});
```

### Global Query Defaults

The global defaults are set in `providers.tsx`. For per-query overrides:

```typescript
const { data } = useQuery({
  queryKey: ['expensive-query'],
  queryFn: fetchExpensiveData,
  staleTime: 5 * 60 * 1000, // Override: 5 minutes
  gcTime: 10 * 60 * 1000, // Override: 10 minutes
});
```

---

## 🔗 Next Steps

After completing this foundation prompt:

1. **Verify setup** by running tests: `pnpm test`
2. **Proceed to Phase 1** - Start with [01-auth-admin-ui.md](./01-auth-admin-ui.md)
3. **Follow prompt order** - Complete prompts sequentially

---

## � Troubleshooting

### Package Version Issues

**Problem:** `npm ERR! 404 Not Found - GET https://registry.npmjs.org/next/-/next-16.1.0.tgz`

**Solution:** The workspace may use a private registry or canary versions. Try:
```bash
# Use flexible version ranges
pnpm add next@^16.0.0 react@^19.0.0 react-dom@^19.0.0

# Or check .npmrc for private registry settings
cat .npmrc
```

---

### Jest ESM Errors

**Problem:** `SyntaxError: Cannot use import statement outside a module`

**Solution:** Ensure these are in place:
1. `package.json` has `"type": "module"`
2. `jest.config.ts` uses `.js` extension for next/jest import
3. Test scripts use `NODE_OPTIONS='--experimental-vm-modules'`
4. Windows users: Install and use `cross-env`

```bash
pnpm add -D cross-env
```

---

### MSW Not Intercepting Requests

**Problem:** API calls bypass MSW during tests

**Solution:** MSW v2 requires **absolute URLs**. Ensure handlers use full URLs:

```typescript
// ❌ Wrong - relative path
http.get('/api/v1/health', ...)

// ✅ Correct - absolute URL
const API_BASE = 'http://localhost:3001/api/v1';
http.get(`${API_BASE}/health`, ...)
```

---

### shadcn Initialization Conflicts

**Problem:** `components.json already exists`

**Solution:** If shadcn was partially initialized:
```bash
# Remove and reinitialize
rm components.json
npx shadcn@latest init

# Or just add individual components
npx shadcn@latest add toast --overwrite
```

---

### SSR/Server Component Auth Issues

**Problem:** `localStorage is not defined` in Server Components

**Solution:** The API client no longer uses localStorage. For Server Components, pass cookies:

```typescript
// In a Server Component
import { cookies } from 'next/headers';

async function getData() {
  const cookieStore = await cookies();
  return apiClient.get('/data', {}, { 
    serverCookies: cookieStore.toString() 
  });
}
```

---

### ⚠️ CRITICAL: Next.js Compilation Deadlock on Auth Pages

**Problem:** Auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`) hang indefinitely during compilation with no error messages—just stuck on "Compiling /login..." forever.

**Root Cause:** Custom hooks or `apiClient` imported at the form component level are evaluated during Next.js build/compile time. These modules depend on client-side APIs (like `useRouter`, React Query hooks) that don't exist in the build context, causing the compilation pipeline to freeze.

**❌ WRONG - Causes compilation deadlock:**
```typescript
// forgot-password-form.tsx
import { apiClient } from "@/lib/api";  // ❌ Triggers bundler evaluation

export default function ForgotPasswordForm() {
  const onSubmit = async (data) => {
    await apiClient.post("/auth/forgot-password", data);  // ❌ Deadlock
  };
}
```

**❌ WRONG - Causes compilation deadlock:**
```typescript
// login-form.tsx
import { useLogin } from "@/lib/hooks/use-auth";  // ❌ Hook import
import { useRouter } from "next/navigation";       // ❌ Router import

export default function LoginForm() {
  const login = useLogin();           // ❌ Hook usage
  const router = useRouter();         // ❌ Router usage
  
  const onSubmit = async (data) => {
    await login.mutateAsync(data);
    router.push("/dashboard");        // ❌ Deadlock
  };
}
```

**✅ CORRECT - Use direct fetch() + window.location:**
```typescript
// login-form.tsx
import { AUTH_CONFIG } from "@/lib/config/auth";  // ✅ Plain config object, no hooks

export default function LoginForm() {
  const onSubmit = async (data) => {
    const response = await fetch("/api/v1/auth/login", {  // ✅ Native fetch
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Login failed");
    }
    
    window.location.href = AUTH_CONFIG.defaultRedirect;  // ✅ Native navigation
  };
}
```

**✅ CORRECT - forgot-password-form.tsx:**
```typescript
export default function ForgotPasswordForm() {
  const onSubmit = async (data) => {
    const response = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Request failed");
    }
  };
}
```

**Key Rules for Auth Forms:**
1. **NO** `import { apiClient } from "@/lib/api"` - use native `fetch()`
2. **NO** `import { useRouter } from "next/navigation"` - use `window.location.href`
3. **NO** `import { useLogin, useLogout } from "@/lib/hooks/use-auth"` - use native `fetch()`
4. **OK** to import plain config objects like `AUTH_CONFIG`
5. **OK** to import form libraries (`useForm`, `zod`, etc.)
6. **OK** to import UI components (`Button`, `Input`, `Form`, etc.)

**Where hooks ARE safe:**
- Dashboard pages (already past auth boundary)
- Components loaded after initial page compile
- Components that don't run during SSR build

---

### React Query Devtools Not Showing

**Problem:** Devtools panel doesn't appear in development

**Solution:** Ensure:
1. `@tanstack/react-query-devtools` is installed
2. Devtools is only rendered in development mode
3. Check browser console for errors

```bash
pnpm add -D @tanstack/react-query-devtools
```

---

## �📚 Reference Documentation

### Project Standards (Internal)
- [Frontend Architecture Standards](../../08-standards/68-frontend-architecture-standards.md) - Page templates, patterns
- [UI Component Standards](../../08-standards/69-ui-component-standards.md) - Component guidelines
- [Testing Strategy](../../08-standards/72-testing-strategy.md) - Jest + RTL patterns
- [Design System Components](../../03-design/46-design-system-components.md) - Component library reference

### External Documentation
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [MSW Documentation](https://mswjs.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
