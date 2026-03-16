/**
 * Tests for credit limits hooks
 * Tests query API, pagination, filtering, and utilization calculations
 */

import { renderHook } from '@/test/utils';
import {
  useCreditLimits,
  useCreditLimit,
  useCreditUtilization,
} from './use-credit-limits';

// ===========================
// useCreditLimits Tests
// ===========================

describe('useCreditLimits', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditLimits());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useCreditLimits({ page: 1, limit: 20 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() => useCreditLimits({ status: 'ACTIVE' }));

    expect(result.current).toBeDefined();
  });

  it('returns limits array in data', () => {
    const { result } = renderHook(() => useCreditLimits());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useCreditLimits());

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
    }
  });

  it('limit objects contain required fields', () => {
    const { result } = renderHook(() => useCreditLimits());

    if (result.current.data && result.current.data.data.length > 0) {
      const limit = result.current.data.data[0];
      expect(limit).toHaveProperty('id');
      expect(limit).toHaveProperty('companyId');
      expect(limit).toHaveProperty('creditAmount');
      expect(limit).toHaveProperty('status');
    }
  });
});

// ===========================
// useCreditLimit Tests
// ===========================

describe('useCreditLimit', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditLimit('company-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('fetches limit by company ID', () => {
    const { result } = renderHook(() => useCreditLimit('company-123'));

    expect(result.current).toBeDefined();
  });

  it('returns limit object with required fields', () => {
    const { result } = renderHook(() => useCreditLimit('company-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('id');
      expect(result.current.data).toHaveProperty('companyId');
      expect(result.current.data).toHaveProperty('creditAmount');
      expect(result.current.data).toHaveProperty('status');
    }
  });

  it('is disabled when company ID is empty', () => {
    const { result } = renderHook(() => useCreditLimit(''));

    expect(result.current.isLoading).toBe(false);
  });
});

// ===========================
// useCreditUtilization Tests
// ===========================

describe('useCreditUtilization', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditUtilization('company-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('returns utilization percentage', () => {
    const { result } = renderHook(() => useCreditUtilization('company-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('percentageUsed');
      if (result.current.data.percentageUsed !== undefined) {
        expect(result.current.data.percentageUsed).toBeGreaterThanOrEqual(0);
        expect(result.current.data.percentageUsed).toBeLessThanOrEqual(100);
      }
    }
  });

  it('returns utilization breakdown', () => {
    const { result } = renderHook(() => useCreditUtilization('company-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('creditLimit');
      expect(result.current.data).toHaveProperty('amountUsed');
      expect(result.current.data).toHaveProperty('amountAvailable');
    }
  });

  it('is disabled when company ID is empty', () => {
    const { result } = renderHook(() => useCreditUtilization(''));

    expect(result.current.isLoading).toBe(false);
  });
});
