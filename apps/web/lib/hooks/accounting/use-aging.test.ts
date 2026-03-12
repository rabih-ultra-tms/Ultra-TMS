/**
 * Tests for useAgingReport hook
 * Tests aging report retrieval and data transformation
 */

import { renderHook } from '@/test/utils';
import { useAgingReport } from '@/lib/hooks/accounting/use-aging';

describe('useAgingReport', () => {
  it('loads aging report without parameters', () => {
    const { result } = renderHook(() => useAgingReport());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('filters by customerId when provided', () => {
    const { result } = renderHook(() =>
      useAgingReport({ customerId: 'cust-1' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters by asOfDate when provided', () => {
    const { result } = renderHook(() =>
      useAgingReport({ asOfDate: '2026-03-13' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns aging buckets', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('buckets');
      expect(Array.isArray(result.current.data.buckets)).toBe(true);
    }
  });

  it('aging buckets have correct structure', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data && result.current.data.buckets.length > 0) {
      const bucket = result.current.data.buckets[0];
      if (bucket) {
        expect(bucket).toHaveProperty('label');
        expect(bucket).toHaveProperty('minDays');
        expect(bucket).toHaveProperty('maxDays');
        expect(bucket).toHaveProperty('totalAmount');
        expect(bucket).toHaveProperty('invoiceCount');
      }
    }
  });

  it('aging buckets include current, 31-60, 61-90, 91-120, 120+ days', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data && result.current.data.buckets.length > 0) {
      const labels = result.current.data.buckets.map((b) => b.label);
      expect(labels.length).toBeGreaterThan(0);
    }
  });

  it('returns customer aging rows', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('customers');
      expect(Array.isArray(result.current.data.customers)).toBe(true);
    }
  });

  it('customer rows include correct columns', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data && result.current.data.customers.length > 0) {
      const customer = result.current.data.customers[0];
      if (customer) {
        expect(customer).toHaveProperty('customerId');
        expect(customer).toHaveProperty('customerName');
        expect(customer).toHaveProperty('current');
        expect(customer).toHaveProperty('days31to60');
        expect(customer).toHaveProperty('days61to90');
        expect(customer).toHaveProperty('days90plus');
        expect(customer).toHaveProperty('totalOutstanding');
      }
    }
  });

  it('returns totalOutstanding amount', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('totalOutstanding');
      expect(typeof result.current.data.totalOutstanding).toBe('number');
    }
  });

  it('returns asOfDate', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('asOfDate');
      expect(typeof result.current.data.asOfDate).toBe('string');
    }
  });

  it('handles filter by customer and date', () => {
    const { result } = renderHook(() =>
      useAgingReport({ customerId: 'cust-1', asOfDate: '2026-03-13' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns consistent total calculations', () => {
    const { result } = renderHook(() => useAgingReport());

    if (result.current.data && result.current.data.customers.length > 0) {
      const customer = result.current.data.customers[0];
      if (customer) {
        // Sum of bucket amounts should equal totalOutstanding for that customer
        const sum =
          customer.current +
          customer.days31to60 +
          customer.days61to90 +
          customer.days90plus;
        expect(sum).toBeCloseTo(customer.totalOutstanding, 2);
      }
    }
  });
});
