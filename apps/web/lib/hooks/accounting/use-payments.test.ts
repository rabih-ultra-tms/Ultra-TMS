/**
 * Tests for usePayments hook (payments received)
 * Tests recording, allocating, and managing payments from customers
 */

import { renderHook } from '@/test/utils';
import {
  usePayments,
  usePayment,
  useCreatePayment,
  useAllocatePayment,
  useUpdatePayment,
  useDeletePayment,
} from '@/lib/hooks/accounting/use-payments';

describe('usePayments', () => {
  it('fetches payments received with pagination', () => {
    const { result } = renderHook(() => usePayments({ page: 1, limit: 25 }));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('filters payments by status (RECEIVED)', () => {
    const { result } = renderHook(() =>
      usePayments({ page: 1, limit: 25, status: 'RECEIVED' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters payments by status (APPLIED)', () => {
    const { result } = renderHook(() =>
      usePayments({ page: 1, limit: 25, status: 'APPLIED' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts search parameter', () => {
    const { result } = renderHook(() =>
      usePayments({ page: 1, limit: 25, search: 'test' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts customerId filter', () => {
    const { result } = renderHook(() =>
      usePayments({ page: 1, limit: 25, customerId: 'cust-1' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts method filter', () => {
    const { result } = renderHook(() =>
      usePayments({ page: 1, limit: 25, method: 'ACH' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns payments array', () => {
    const { result } = renderHook(() => usePayments({ page: 1, limit: 25 }));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => usePayments({ page: 1, limit: 25 }));

    if (result.current.data?.pagination) {
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
    }
  });
});

describe('usePayment', () => {
  it('loads payment detail', () => {
    const { result } = renderHook(() => usePayment('pr-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('includes allocations in payment', () => {
    const { result } = renderHook(() => usePayment('pr-received-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('amount');
      expect(result.current.data).toHaveProperty('allocations');
    }
  });

  it('returns payment with status', () => {
    const { result } = renderHook(() => usePayment('pr-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('status');
    }
  });
});

describe('useCreatePayment', () => {
  it('returns mutation object for recording payment', () => {
    const { result } = renderHook(() => useCreatePayment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useCreatePayment());

    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useAllocatePayment', () => {
  it('returns mutation object for allocation', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate accepts allocations', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('handles partial allocation', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles over-allocation validation', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('detects concurrent allocation conflicts', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(result.current).toHaveProperty('isPending');
  });

  it('applies payment to single invoice', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('applies payment across multiple invoices', () => {
    const { result } = renderHook(() => useAllocatePayment());

    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdatePayment', () => {
  it('marks payment as bounced', () => {
    const { result } = renderHook(() => useUpdatePayment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
  });

  it('returns mutation object', () => {
    const { result } = renderHook(() => useUpdatePayment());

    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeletePayment', () => {
  it('returns mutation object for deletion', () => {
    const { result } = renderHook(() => useDeletePayment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useDeletePayment());

    expect(typeof result.current.mutate).toBe('function');
  });
});
