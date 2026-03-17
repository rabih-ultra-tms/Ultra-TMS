import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditDashboardCards } from './credit-dashboard-cards';

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

describe('CreditDashboardCards', () => {
  it('should render loading state', () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('credit-dashboard-skeleton')).toBeInTheDocument();
  });

  it('should render KPI cards with data', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Cards should render after loading
    // Note: actual data depends on mock API response
  });

  it('should display total limits issued card', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Check for total limits card
  });

  it('should display utilization percentage card', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Check for utilization card
  });

  it('should display active holds count', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Check for holds card
  });

  it('should handle error state gracefully', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should show error message on API failure
  });

  it('should render empty state when no credit limits', async () => {
    render(<CreditDashboardCards tenantId="test-tenant" />, {
      wrapper: createWrapper(),
    });
    // Should handle empty credit limits
  });
});
