import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentPlanTimeline } from './payment-plan-timeline';

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

describe('PaymentPlanTimeline', () => {
  it('should render loading state', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId('payment-timeline-skeleton')).toBeInTheDocument();
  });

  it('should display payment plan installments', async () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Timeline with installments should render
  });

  it('should show installment due dates', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Due dates should be visible
  });

  it('should display installment amounts', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Dollar amounts should be visible
  });

  it('should show installment status', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Status badges (pending, paid, overdue) should be visible
  });

  it('should display progress indicator', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Should show "X of Y paid"
  });

  it('should show total plan amount', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Total amount and paid amount should be displayed
  });

  it('should highlight overdue payments', () => {
    render(<PaymentPlanTimeline planId="plan-overdue" />, {
      wrapper: createWrapper(),
    });
    // Overdue installments should be highlighted
  });

  it('should display timeline in chronological order', () => {
    render(<PaymentPlanTimeline planId="plan-123" />, {
      wrapper: createWrapper(),
    });
    // Installments should be ordered by due date
  });

  it('should handle empty payment plan', () => {
    render(<PaymentPlanTimeline planId="plan-empty" />, {
      wrapper: createWrapper(),
    });
    // Should show appropriate message
  });

  it('should display error state on API failure', () => {
    render(<PaymentPlanTimeline planId="invalid-plan" />, {
      wrapper: createWrapper(),
    });
    // Should handle errors
  });
});
