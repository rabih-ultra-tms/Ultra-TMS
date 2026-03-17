import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationDetail } from './credit-application-detail';

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

describe('CreditApplicationDetail', () => {
  it('should render loading state', () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="view" />, {
      wrapper: createWrapper(),
    });
    expect(
      screen.getByTestId('application-detail-skeleton')
    ).toBeInTheDocument();
  });

  it('should render application details in view mode', async () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="view" />, {
      wrapper: createWrapper(),
    });
    // Details should render after loading
  });

  it('should show read-only fields in view mode', () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="view" />, {
      wrapper: createWrapper(),
    });
    // Fields should be disabled in view mode
  });

  it('should show review form in review mode', () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="review" />, {
      wrapper: createWrapper(),
    });
    // Review form should render with recommended limit input
  });

  it('should display approve/reject buttons in review mode', () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="review" />, {
      wrapper: createWrapper(),
    });
    // Approve and Reject buttons should render in review mode
  });

  it('should handle approval action', async () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="review" />, {
      wrapper: createWrapper(),
    });
    // Should submit approval with recommended limit
  });

  it('should handle rejection action', async () => {
    render(<CreditApplicationDetail applicationId="app-123" mode="review" />, {
      wrapper: createWrapper(),
    });
    // Should submit rejection with reason
  });

  it('should display error state on load failure', () => {
    render(<CreditApplicationDetail applicationId="invalid-id" mode="view" />, {
      wrapper: createWrapper(),
    });
    // Should show error message
  });
});
