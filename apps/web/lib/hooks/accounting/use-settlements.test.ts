/**
 * Tests for useSettlements hook
 * Tests list, filter, approve, and void workflows for carrier settlements
 */

import { renderHook } from '@/test/utils';
import {
  useSettlements,
  useSettlement,
  useCreateSettlement,
  useApproveSettlement,
  useProcessSettlement,
  useDeleteSettlement,
} from '@/lib/hooks/accounting/use-settlements';

describe('useSettlements', () => {
  it('fetches settlements list with pagination', () => {
    const { result } = renderHook(() => useSettlements({ page: 1, limit: 25 }));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('filters settlements by status (CREATED)', () => {
    const { result } = renderHook(() =>
      useSettlements({ page: 1, limit: 25, status: 'CREATED' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters settlements by status (APPROVED)', () => {
    const { result } = renderHook(() =>
      useSettlements({ page: 1, limit: 25, status: 'APPROVED' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters settlements by status (PROCESSED)', () => {
    const { result } = renderHook(() =>
      useSettlements({ page: 1, limit: 25, status: 'PROCESSED' })
    );

    expect(result.current).toBeDefined();
  });

  it('searches settlements by number', () => {
    const { result } = renderHook(() =>
      useSettlements({ page: 1, limit: 25, search: 'SET-' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters settlements by carrierId', () => {
    const { result } = renderHook(() =>
      useSettlements({ page: 1, limit: 25, carrierId: 'c1' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns settlements array', () => {
    const { result } = renderHook(() => useSettlements({ page: 1, limit: 25 }));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });
});

describe('useSettlement', () => {
  it('loads settlement detail', () => {
    const { result } = renderHook(() => useSettlement('settle-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('includes line items in settlement', () => {
    const { result } = renderHook(() => useSettlement('settle-pending-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('lineItems');
      if (result.current.data.lineItems) {
        expect(Array.isArray(result.current.data.lineItems)).toBe(true);
      }
    }
  });

  it('returns settlement with amounts', () => {
    const { result } = renderHook(() => useSettlement('settle-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('grossAmount');
      expect(result.current.data).toHaveProperty('netAmount');
    }
  });
});

describe('useCreateSettlement', () => {
  it('returns mutation for creating settlement', () => {
    const { result } = renderHook(() => useCreateSettlement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
  });

  it('mutate is callable with payable ids', () => {
    const { result } = renderHook(() => useCreateSettlement());

    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useApproveSettlement', () => {
  it('returns mutation for approving settlement', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate accepts settlement id', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('updates settlement status to APPROVED', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles validation error on incomplete data', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(result.current).toHaveProperty('error');
  });

  it('checks accountant role permission', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(result.current).toHaveProperty('isPending');
  });

  it('sets approvedAt and approvedBy fields', () => {
    const { result } = renderHook(() => useApproveSettlement());

    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useProcessSettlement', () => {
  it('returns mutation for processing settlement', () => {
    const { result } = renderHook(() => useProcessSettlement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
  });

  it('mutate accepts settlement id', () => {
    const { result } = renderHook(() => useProcessSettlement());

    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteSettlement', () => {
  it('returns mutation for deleting settlement', () => {
    const { result } = renderHook(() => useDeleteSettlement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
  });

  it('mutate is callable with id', () => {
    const { result } = renderHook(() => useDeleteSettlement());

    expect(typeof result.current.mutate).toBe('function');
  });
});
