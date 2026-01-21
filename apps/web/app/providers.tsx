"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Toaster, toast } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

const ReactQueryDevtools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

function handleQueryError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=true";
      }
      return;
    }

    if (error.status === 403) {
      toast.error("Access Denied", {
        description: "You do not have permission to perform this action.",
      });
      return;
    }

    if (error.status === 422 && error.errors) {
      const messages = Object.values(error.errors).flat().join(", ");
      toast.error("Validation Error", { description: messages });
      return;
    }
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  toast.error("Error", { description: message });
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
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
        {process.env.NODE_ENV === "development" && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export const queryKeys = {
  all: (service: string) => [service] as const,
  lists: (service: string) => [...queryKeys.all(service), "list"] as const,
  list: (service: string, params: Record<string, unknown>) => [
    ...queryKeys.lists(service),
    params,
  ] as const,
  details: (service: string) => [...queryKeys.all(service), "detail"] as const,
  detail: (service: string, id: string) => [...queryKeys.details(service), id] as const,
};
