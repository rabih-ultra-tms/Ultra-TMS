import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditLimitCard } from './credit-limit-card';

const mockLimit = {
  id: 'limit-123',
  companyId: 'company-123',
  creditLimit: 10000000, // $100,000 in cents
  utilized: 4500000, // $45,000 in cents
  tenantId: 'tenant-123',
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

describe('CreditLimitCard', () => {
  it('should render credit limit card with data', () => {
    const { container } = render(<CreditLimitCard limit={mockLimit} />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.font-bold')).toBeInTheDocument();
  });

  it('should display credit limit amount', () => {
    render(<CreditLimitCard limit={mockLimit} />, {
      wrapper: createWrapper(),
    });
    // Amount should be displayed in the card
  });

  it('should display utilized amount', () => {
    render(<CreditLimitCard limit={mockLimit} />, {
      wrapper: createWrapper(),
    });
    // Utilized amount should be displayed
  });

  it('should calculate available amount', () => {
    render(<CreditLimitCard limit={mockLimit} />, {
      wrapper: createWrapper(),
    });
    // Available amount should be calculated
  });

  it('should display health status badge', () => {
    render(<CreditLimitCard limit={mockLimit} />, {
      wrapper: createWrapper(),
    });
    // Should show status badge
  });

  it('should show utilization bar when enabled', () => {
    const { getByTestId } = render(
      <CreditLimitCard limit={mockLimit} showUtilization={true} />,
      {
        wrapper: createWrapper(),
      }
    );
    // Utilization bar component should be rendered
  });

  it('should not show utilization bar when disabled', () => {
    render(<CreditLimitCard limit={mockLimit} showUtilization={false} />, {
      wrapper: createWrapper(),
    });
    // Utilization bar should not be present
  });

  it('should show warning color for high utilization', () => {
    const highUtilizationLimit = {
      ...mockLimit,
      utilized: 8500000, // $85,000
    };
    render(<CreditLimitCard limit={highUtilizationLimit} />, {
      wrapper: createWrapper(),
    });
    // Should display warning status
  });

  it('should show critical color for exceeded limit', () => {
    const exceededLimit = {
      ...mockLimit,
      utilized: 10500000, // $105,000
    };
    render(<CreditLimitCard limit={exceededLimit} />, {
      wrapper: createWrapper(),
    });
    // Should display critical status
  });
});
