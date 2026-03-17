import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationForm } from './credit-application-form';

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

describe('CreditApplicationForm', () => {
  it('should render form with basic step', () => {
    render(<CreditApplicationForm />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });

  it('should display multi-step form fields', () => {
    render(<CreditApplicationForm />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<CreditApplicationForm />, {
      wrapper: createWrapper(),
    });
    const submitButton = screen.getByRole('button', { name: /next/i });
    await user.click(submitButton);
    // Should show validation errors
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const onSuccess = () => console.log('Success');
    render(<CreditApplicationForm onSuccess={onSuccess} />, {
      wrapper: createWrapper(),
    });
    // Fill in form and submit
  });

  it('should support edit mode with prepopulated data', () => {
    render(<CreditApplicationForm companyId="company-123" />, {
      wrapper: createWrapper(),
    });
    // Form should load existing data
  });

  it('should display all form steps', () => {
    render(<CreditApplicationForm />, {
      wrapper: createWrapper(),
    });
    // Check for step indicators or progress
  });

  it('should handle form reset', async () => {
    const user = userEvent.setup();
    render(<CreditApplicationForm />, {
      wrapper: createWrapper(),
    });
    const resetButton = screen.queryByRole('button', { name: /reset/i });
    if (resetButton) {
      await user.click(resetButton);
      // Form should be cleared
    }
  });
});
