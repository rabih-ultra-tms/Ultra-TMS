import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render as rtlRender,
  screen as rtlScreen,
  waitFor as rtlWaitFor,
  within as rtlWithin,
  act as rtlAct,
  fireEvent as rtlFireEvent,
  cleanup as rtlCleanup,
  type RenderOptions,
} from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

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

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof rtlRender> {
  return rtlRender(ui, { wrapper: createWrapper(), ...options });
}

export function waitForQueryToSettle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Bind re-exports for ESM compatibility
const screen = rtlScreen;
const waitFor = rtlWaitFor;
const within = rtlWithin;
const act = rtlAct;
const fireEvent = rtlFireEvent;
const cleanup = rtlCleanup;

export { screen, waitFor, within, act, fireEvent, cleanup };
export { customRender as render };
