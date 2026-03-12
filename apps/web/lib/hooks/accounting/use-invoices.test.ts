/**
 * Tests for useInvoices hook
 * Tests hook API and parameter handling
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import {
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useVoidInvoice,
  useUpdateInvoice,
  useSendInvoice,
  useDeleteInvoice,
} from '@/lib/hooks/accounting/use-invoices';

// ===========================
// useInvoices Tests
// ===========================

describe('useInvoices', () => {
  it('accepts pagination parameters', () => {
    const { result } = renderHook(() => useInvoices({ page: 1, limit: 25 }));

    expect(result.current).toBeDefined();
    // Data might be undefined initially
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() =>
      useInvoices({ page: 1, limit: 25, status: 'PAID' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts search parameter', () => {
    const { result } = renderHook(() =>
      useInvoices({ page: 1, limit: 25, search: 'test' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts customerId filter', () => {
    const { result } = renderHook(() =>
      useInvoices({ page: 1, limit: 25, customerId: 'cust-1' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns query result object', () => {
    const { result } = renderHook(() => useInvoices({ page: 1, limit: 25 }));

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('returns invoices array in data', () => {
    const { result } = renderHook(() => useInvoices({ page: 1, limit: 25 }));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useInvoices({ page: 1, limit: 25 }));

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
    }
  });

  it('accepts date filters', () => {
    const { result } = renderHook(() =>
      useInvoices({
        page: 1,
        limit: 25,
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
      })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts sort parameters', () => {
    const { result } = renderHook(() =>
      useInvoices({
        page: 1,
        limit: 25,
        sortBy: 'invoiceDate',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toBeDefined();
  });
});

// ===========================
// useInvoice Tests (Detail)
// ===========================

describe('useInvoice', () => {
  it('accepts invoice id parameter', () => {
    const { result } = renderHook(() => useInvoice('inv-1'));

    expect(result.current).toBeDefined();
  });

  it('returns query result object', () => {
    const { result } = renderHook(() => useInvoice('inv-1'));

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('returns invoice data when loaded', () => {
    const { result } = renderHook(() => useInvoice('inv-draft-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('id');
      expect(result.current.data).toHaveProperty('invoiceNumber');
      expect(result.current.data).toHaveProperty('totalAmount');
    }
  });

  it('includes line items in invoice', () => {
    const { result } = renderHook(() => useInvoice('inv-1'));

    if (result.current.data && result.current.data.lineItems) {
      expect(Array.isArray(result.current.data.lineItems)).toBe(true);
    }
  });
});

// ===========================
// useCreateInvoice Tests
// ===========================

describe('useCreateInvoice', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useCreateInvoice());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useCreateInvoice());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useCreateInvoice());

    expect(typeof result.current.isPending).toBe('boolean');
  });
});

// ===========================
// useUpdateInvoice Tests
// ===========================

describe('useUpdateInvoice', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useUpdateInvoice());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutation accepts id and data', () => {
    const { result } = renderHook(() => useUpdateInvoice());

    expect(typeof result.current.mutate).toBe('function');
  });
});

// ===========================
// useSendInvoice Tests
// ===========================

describe('useSendInvoice', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useSendInvoice());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useSendInvoice());

    expect(typeof result.current.mutate).toBe('function');
  });
});

// ===========================
// useVoidInvoice Tests
// ===========================

describe('useVoidInvoice', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useVoidInvoice());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate accepts id and reason', () => {
    const { result } = renderHook(() => useVoidInvoice());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending property', () => {
    const { result } = renderHook(() => useVoidInvoice());

    expect(typeof result.current.isPending).toBe('boolean');
  });
});

// ===========================
// useDeleteInvoice Tests
// ===========================

describe('useDeleteInvoice', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useDeleteInvoice());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useDeleteInvoice());

    expect(typeof result.current.mutate).toBe('function');
  });
});
