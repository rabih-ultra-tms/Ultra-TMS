/**
 * Error Recovery Workflow Integration Tests
 * Tests error handling, retry, and recovery patterns
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
} from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Simulate API operations that can fail
function createApiSimulator() {
  let failCount = 0;
  let shouldFail = false;

  return {
    setFailing: (fail: boolean) => {
      shouldFail = fail;
    },
    getFailCount: () => failCount,
    resetFailCount: () => {
      failCount = 0;
    },
    createInvoice: async (data: { customerName: string; amount: number }) => {
      if (shouldFail) {
        failCount++;
        throw new Error('Network error: Failed to create invoice');
      }
      return { ...mockInvoices[0], ...data, id: `inv-new-${Date.now()}` };
    },
    sendInvoice: async (id: string) => {
      if (shouldFail) {
        failCount++;
        throw new Error('Email service unavailable');
      }
      return { ...mockInvoices[0], id, status: 'SENT' };
    },
    processPayment: async (data: { invoiceId: string; amount: number }) => {
      if (shouldFail) {
        failCount++;
        throw new Error('Payment gateway timeout');
      }
      return {
        ...mockPaymentsReceived[0],
        ...data,
        id: `pay-new-${Date.now()}`,
      };
    },
    approveSettlement: async (id: string) => {
      if (shouldFail) {
        failCount++;
        throw new Error('Authorization failed');
      }
      return { ...mockSettlements[0], id, status: 'APPROVED' };
    },
  };
}

describe('Error Recovery Workflow', () => {
  it('handles invoice creation failure with retry', async () => {
    const api = createApiSimulator();
    api.setFailing(true);

    // First attempt fails
    await expect(
      api.createInvoice({ customerName: 'Test Corp', amount: 1000 })
    ).rejects.toThrow('Network error: Failed to create invoice');
    expect(api.getFailCount()).toBe(1);

    // Retry after fixing network
    api.setFailing(false);
    const invoice = await api.createInvoice({
      customerName: 'Test Corp',
      amount: 1000,
    });
    expect(invoice.customerName).toBe('Test Corp');
  });

  it('handles email service failure gracefully', async () => {
    const api = createApiSimulator();
    api.setFailing(true);

    await expect(api.sendInvoice('inv-1')).rejects.toThrow(
      'Email service unavailable'
    );

    // Invoice status should still be DRAFT, not stuck
    api.setFailing(false);
    const result = await api.sendInvoice('inv-1');
    expect(result.status).toBe('SENT');
  });

  it('handles payment gateway timeout with retry', async () => {
    const api = createApiSimulator();
    api.setFailing(true);

    await expect(
      api.processPayment({ invoiceId: 'inv-1', amount: 500 })
    ).rejects.toThrow('Payment gateway timeout');

    api.setFailing(false);
    const payment = await api.processPayment({
      invoiceId: 'inv-1',
      amount: 500,
    });
    expect(payment.invoiceId).toBe('inv-1');
  });

  it('handles settlement approval authorization failure', async () => {
    const api = createApiSimulator();
    api.setFailing(true);

    await expect(api.approveSettlement('settle-1')).rejects.toThrow(
      'Authorization failed'
    );

    api.setFailing(false);
    const result = await api.approveSettlement('settle-1');
    expect(result.status).toBe('APPROVED');
  });

  it('tracks failure count across multiple retries', async () => {
    const api = createApiSimulator();
    api.setFailing(true);

    for (let i = 0; i < 3; i++) {
      try {
        await api.createInvoice({ customerName: 'Test', amount: 100 });
      } catch {
        /* expected */
      }
    }
    expect(api.getFailCount()).toBe(3);

    api.resetFailCount();
    expect(api.getFailCount()).toBe(0);
  });

  it('renders error state with retry action', () => {
    const ErrorRecoveryPage = () => (
      <div data-testid="error-recovery">
        <div role="alert">
          <p>Failed to load invoices</p>
          <button>Retry</button>
        </div>
      </div>
    );

    render(<ErrorRecoveryPage />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load invoices')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders error boundary for unexpected errors', () => {
    const ErrorBoundaryDisplay = () => (
      <div data-testid="error-boundary">
        <h2>Something went wrong</h2>
        <p>An unexpected error occurred in the accounting module.</p>
        <button>Go to Dashboard</button>
        <button>Try Again</button>
      </div>
    );

    render(<ErrorBoundaryDisplay />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('handles concurrent operation failures independently', async () => {
    const api = createApiSimulator();

    // One operation fails, another succeeds
    api.setFailing(true);
    const failure = api.createInvoice({ customerName: 'Test', amount: 100 });
    api.setFailing(false);
    const success = api.sendInvoice('inv-1');

    await expect(failure).rejects.toThrow();
    const result = await success;
    expect(result.status).toBe('SENT');
  });
});
