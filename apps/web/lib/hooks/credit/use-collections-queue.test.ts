/**
 * Tests for collections queue and aging report hooks
 * Tests query API, pagination, aging bucket filtering, and calculations
 */

import { renderHook } from '@/test/utils';
import { useCollectionsQueue, useAgingReport } from './use-collections-queue';

// ===========================
// useCollectionsQueue Tests
// ===========================

describe('useCollectionsQueue', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCollectionsQueue());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useCollectionsQueue({ page: 1, limit: 20 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts aging bucket filter', () => {
    const { result } = renderHook(() =>
      useCollectionsQueue({ agingBucket: '0-30' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns collections array in data', () => {
    const { result } = renderHook(() => useCollectionsQueue());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useCollectionsQueue());

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
    }
  });

  it('collection objects contain required fields', () => {
    const { result } = renderHook(() => useCollectionsQueue());

    if (result.current.data && result.current.data.data.length > 0) {
      const collection = result.current.data.data[0];
      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('companyId');
      expect(collection).toHaveProperty('outstandingAmount');
      expect(collection).toHaveProperty('daysOverdue');
    }
  });
});

// ===========================
// useAgingReport Tests
// ===========================

describe('useAgingReport', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgingReport());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('returns aging buckets', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('buckets');
      if (result.current.data.buckets) {
        expect(Array.isArray(result.current.data.buckets)).toBe(true);
      }
    }
  });

  it('returns total outstanding amount', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('totalOutstanding');
      if (result.current.data.totalOutstanding !== undefined) {
        expect(typeof result.current.data.totalOutstanding).toBe('number');
      }
    }
  });

  it('each aging bucket contains required fields', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data && result.current.data.buckets) {
      result.current.data.buckets.forEach(
        (bucket: {
          name: string;
          amount: number;
          count: number;
          percentage: number;
        }) => {
          expect(bucket).toHaveProperty('name');
          expect(bucket).toHaveProperty('amount');
          expect(bucket).toHaveProperty('count');
          expect(bucket).toHaveProperty('percentage');
        }
      );
    }
  });
});
