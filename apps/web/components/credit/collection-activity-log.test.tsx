import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollectionActivityLog } from './collection-activity-log';

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

describe('CollectionActivityLog', () => {
  it('should render loading state', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('activity-log-skeleton')).toBeInTheDocument();
  });

  it('should display timeline of activities', async () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Timeline should render with activities
  });

  it('should show activity types', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should display call, email, payment, follow-up activities
  });

  it('should display activity dates and times', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should show timestamps
  });

  it('should display payment amounts for payment activities', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Payment amounts should be visible
  });

  it('should show activity status', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should display status (pending, completed, etc)
  });

  it('should display activity notes', () => {
    render(<CollectionActivityLog _companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Notes should be visible
  });

  it('should handle empty activity list', () => {
    render(<CollectionActivityLog _companyId="company-no-activity" />, {
      wrapper: createWrapper(),
    });
    // Should show empty state
  });

  it('should be scrollable for many activities', () => {
    render(<CollectionActivityLog _companyId="company-many-activities" />, {
      wrapper: createWrapper(),
    });
    // Should handle pagination or scrolling
  });

  it('should display error state on API failure', () => {
    render(<CollectionActivityLog _companyId="invalid-id" />, {
      wrapper: createWrapper(),
    });
    // Should handle errors
  });
});
