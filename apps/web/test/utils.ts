/**
 * Test utilities for rendering hooks with React Query and MSW setup
 * Provides renderHook wrapper with QueryClientProvider and MSW mocking
 */

import {
  renderHook as rtlRenderHook,
  RenderHookOptions,
} from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a wrapper component that provides QueryClient
 * Useful for testing React Query hooks
 */
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

/**
 * Render hook with React Query provider
 * Wraps @testing-library/react renderHook with QueryClientProvider
 */
export function renderHook<TProps, TResult>(
  render: (initialProps: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) {
  const wrapper = options?.wrapper || createQueryWrapper();
  return rtlRenderHook(render, { ...options, wrapper });
}

// Re-export commonly used testing utilities
export { waitFor, act } from '@testing-library/react';
export type { RenderHookOptions } from '@testing-library/react';
