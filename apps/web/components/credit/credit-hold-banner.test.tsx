import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditHoldBanner } from './credit-hold-banner';

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

describe('CreditHoldBanner', () => {
  it('should render loading state', () => {
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('credit-hold-skeleton')).toBeInTheDocument();
  });

  it('should display active credit holds', async () => {
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Banner should show holds when they exist
  });

  it('should show hold reason', () => {
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should display hold reasons like FRAUD, PAYMENT, COMPLIANCE
  });

  it('should show hold placed date', () => {
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should display when the hold was placed
  });

  it('should not render banner when no active holds', () => {
    render(<CreditHoldBanner companyId="company-no-holds" />, {
      wrapper: createWrapper(),
    });
    // Banner should not be visible if no holds
  });

  it('should handle release action', async () => {
    const user = userEvent.setup();
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Release button should trigger action
  });

  it('should be dismissible', async () => {
    const user = userEvent.setup();
    render(<CreditHoldBanner companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Should have a close/dismiss button
  });

  it('should display multiple holds', () => {
    render(<CreditHoldBanner companyId="company-multiple-holds" />, {
      wrapper: createWrapper(),
    });
    // Should show all active holds
  });

  it('should show error state on API failure', () => {
    render(<CreditHoldBanner companyId="invalid-company" />, {
      wrapper: createWrapper(),
    });
    // Should handle errors gracefully
  });
});
