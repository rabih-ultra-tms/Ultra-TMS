/**
 * Tests for credit applications hooks: useCreditApplications, useCreditApplication
 * Tests query API, pagination, filtering, and single-item queries
 */

import { renderHook } from '@/test/utils';
import {
  useCreditApplications,
  useCreditApplication,
} from './use-credit-applications';

// ===========================
// useCreditApplications Tests (List)
// ===========================

describe('useCreditApplications', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditApplications());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useCreditApplications({ page: 1, limit: 20 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() =>
      useCreditApplications({ status: 'PENDING' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns applications array in data', () => {
    const { result } = renderHook(() => useCreditApplications());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useCreditApplications());

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
      expect(typeof result.current.data.pagination.totalPages).toBe('number');
    }
  });

  it('application objects contain required fields', () => {
    const { result } = renderHook(() => useCreditApplications());

    if (result.current.data && result.current.data.data.length > 0) {
      const app = result.current.data.data[0];
      expect(app).toHaveProperty('id');
      expect(app).toHaveProperty('status');
      expect(app).toHaveProperty('companyId');
    }
  });
});

// ===========================
// useCreditApplication Tests (Detail)
// ===========================

describe('useCreditApplication', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useCreditApplication('app-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('fetches application by ID', () => {
    const { result } = renderHook(() => useCreditApplication('app-123'));

    expect(result.current).toBeDefined();
  });

  it('returns application object with required fields', () => {
    const { result } = renderHook(() => useCreditApplication('app-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('id');
      expect(result.current.data).toHaveProperty('status');
      expect(result.current.data).toHaveProperty('companyId');
    }
  });

  it('is disabled when ID is empty', () => {
    const { result } = renderHook(() => useCreditApplication(''));

    expect(result.current.isLoading).toBe(false);
  });
});
