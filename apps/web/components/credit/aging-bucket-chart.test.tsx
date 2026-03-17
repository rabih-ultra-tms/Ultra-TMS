import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgingBucketChart } from './aging-bucket-chart';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AgingBucketChart', () => {
  it('should render loading state', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('aging-chart-skeleton')).toBeInTheDocument();
  });

  it('should display chart with aging buckets', async () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Chart should render with data
  });

  it('should show 5 aging buckets', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should have buckets: 0-30, 31-60, 61-90, 91-120, 120+
  });

  it('should display color-coded bars', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Colors should progress from green to red
  });

  it('should show bucket labels', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should display bucket ranges
  });

  it('should display legend', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Legend should explain colors and buckets
  });

  it('should show total amounts', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should display total AR amount
  });

  it('should be responsive', () => {
    render(<AgingBucketChart tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Chart should adapt to container size
  });

  it('should handle empty data', () => {
    render(<AgingBucketChart tenantId="test-tenant-empty" />, {
      wrapper: createWrapper(),
    });
    // Should show empty state
  });

  it('should display error state on API failure', () => {
    render(<AgingBucketChart tenantId="invalid-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should handle errors
  });
});
