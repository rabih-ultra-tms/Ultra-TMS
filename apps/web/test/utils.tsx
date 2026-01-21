import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">): ReturnType<typeof render> {
  return render(ui, { wrapper: createWrapper(), ...options });
}

export function waitForQueryToSettle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export * from "@testing-library/react";
export { customRender as render };
