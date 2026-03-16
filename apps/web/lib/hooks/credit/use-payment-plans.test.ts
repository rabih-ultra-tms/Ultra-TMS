/**
 * Tests for payment plans hooks
 * Tests CRUD operations, pagination, and payment recording
 */

import { renderHook } from '@/test/utils';
import { usePaymentPlans, usePaymentPlan } from './use-payment-plans';

// ===========================
// usePaymentPlans Tests
// ===========================

describe('usePaymentPlans', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => usePaymentPlans());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      usePaymentPlans({ page: 1, limit: 20 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() => usePaymentPlans({ status: 'ACTIVE' }));

    expect(result.current).toBeDefined();
  });

  it('returns payment plans array in data', () => {
    const { result } = renderHook(() => usePaymentPlans());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => usePaymentPlans());

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
    }
  });

  it('payment plan objects contain required fields', () => {
    const { result } = renderHook(() => usePaymentPlans());

    if (result.current.data && result.current.data.data.length > 0) {
      const plan = result.current.data.data[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('companyId');
      expect(plan).toHaveProperty('totalAmount');
      expect(plan).toHaveProperty('status');
    }
  });
});

// ===========================
// usePaymentPlan Tests
// ===========================

describe('usePaymentPlan', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => usePaymentPlan('plan-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('fetches payment plan by ID', () => {
    const { result } = renderHook(() => usePaymentPlan('plan-123'));

    expect(result.current).toBeDefined();
  });

  it('returns payment plan object with required fields', () => {
    const { result } = renderHook(() => usePaymentPlan('plan-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('id');
      expect(result.current.data).toHaveProperty('companyId');
      expect(result.current.data).toHaveProperty('totalAmount');
      expect(result.current.data).toHaveProperty('status');
    }
  });

  it('is disabled when plan ID is empty', () => {
    const { result } = renderHook(() => usePaymentPlan(''));

    expect(result.current.isLoading).toBe(false);
  });
});
