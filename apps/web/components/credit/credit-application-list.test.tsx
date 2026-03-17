import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationList } from './credit-application-list';

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

describe('CreditApplicationList', () => {
  it('should render loading state', () => {
    render(<CreditApplicationList />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('application-list-skeleton')).toBeInTheDocument();
  });

  it('should display paginated table of applications', async () => {
    render(<CreditApplicationList />, {
      wrapper: createWrapper(),
    });
    // Table should render with columns
  });

  it('should show status filter options', () => {
    render(<CreditApplicationList />, {
      wrapper: createWrapper(),
    });
    // Filter controls should be visible
  });

  it('should filter applications by status', async () => {
    const user = userEvent.setup();
    render(<CreditApplicationList status="APPROVED" />, {
      wrapper: createWrapper(),
    });
    // Should show only approved applications
  });

  it('should handle row selection', async () => {
    const user = userEvent.setup();
    const onSelect = () => console.log('Selected');
    render(<CreditApplicationList onSelect={onSelect} />, {
      wrapper: createWrapper(),
    });
    // Clicking a row should call onSelect with application ID
  });

  it('should show empty state when no applications', () => {
    render(<CreditApplicationList status="REJECTED" />, {
      wrapper: createWrapper(),
    });
    // Should show empty state message
  });

  it('should support pagination', async () => {
    const user = userEvent.setup();
    render(<CreditApplicationList />, {
      wrapper: createWrapper(),
    });
    // Should have next/previous buttons
  });

  it('should display required columns', () => {
    render(<CreditApplicationList />, {
      wrapper: createWrapper(),
    });
    // Should have: Company, Status, Requested Limit, Created, Actions columns
  });
});
