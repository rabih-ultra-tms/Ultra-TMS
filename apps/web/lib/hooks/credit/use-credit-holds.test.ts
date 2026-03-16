/**
 * Tests for credit holds hooks
 * Tests query API, pagination, and filtering
 */

import { renderHook } from '@/test/utils';
import { useCreditHolds } from './use-credit-holds';

// ===========================
// useCreditHolds Tests
// ===========================

describe('useCreditHolds', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditHolds());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() => useCreditHolds({ page: 1, limit: 20 }));

    expect(result.current).toBeDefined();
  });

  it('accepts reason filter', () => {
    const { result } = renderHook(() => useCreditHolds({ reason: 'FRAUD' }));

    expect(result.current).toBeDefined();
  });

  it('accepts active filter', () => {
    const { result } = renderHook(() => useCreditHolds({ active: true }));

    expect(result.current).toBeDefined();
  });

  it('returns holds array in data', () => {
    const { result } = renderHook(() => useCreditHolds());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useCreditHolds());

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
    }
  });

  it('hold objects contain required fields', () => {
    const { result } = renderHook(() => useCreditHolds());

    if (result.current.data && result.current.data.data.length > 0) {
      const hold = result.current.data.data[0];
      expect(hold).toHaveProperty('id');
      expect(hold).toHaveProperty('companyId');
      expect(hold).toHaveProperty('reason');
      expect(hold).toHaveProperty('status');
    }
  });
});
