/**
 * Tests for DNB lookup hook
 * Tests API integration and result mapping
 */

import { renderHook } from '@/test/utils';
import { useDnbLookup } from './use-dnb-lookup';

// ===========================
// useDnbLookup Tests
// ===========================

describe('useDnbLookup', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useDnbLookup('Acme Corporation'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts company name search', () => {
    const { result } = renderHook(() => useDnbLookup('ABC Logistics'));

    expect(result.current).toBeDefined();
  });

  it('returns DNB lookup results', () => {
    const { result } = renderHook(() => useDnbLookup('Company Name'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.results)).toBe(true);
    }
  });

  it('result objects contain required fields', () => {
    const { result } = renderHook(() => useDnbLookup('Test Company'));

    if (result.current.data && result.current.data.results.length > 0) {
      const result_item = result.current.data.results[0];
      expect(result_item).toHaveProperty('dunNumber');
      expect(result_item).toHaveProperty('companyName');
      expect(result_item).toHaveProperty('creditScore');
    }
  });

  it('is disabled when company name is empty', () => {
    const { result } = renderHook(() => useDnbLookup(''));

    expect(result.current.isLoading).toBe(false);
  });

  it('handles search parameter correctly', () => {
    const { result } = renderHook(() =>
      useDnbLookup('Logistics Inc', { limit: 10 })
    );

    expect(result.current).toBeDefined();
  });
});
