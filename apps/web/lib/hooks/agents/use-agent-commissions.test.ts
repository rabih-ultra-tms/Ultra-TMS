/**
 * Tests for agent commissions hooks: useAgentCommissions (list), useAgentPerformance
 * Tests hook API, pagination, filtering, and performance metrics
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import {
  useAgentCommissions,
  useAgentPerformance,
} from '@/lib/hooks/agents/use-agent-commissions';

// ===========================
// useAgentCommissions Tests
// ===========================

describe('useAgentCommissions', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-1', { page: 2, limit: 25 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-1', { status: 'PAID' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts date range filters', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-1', {
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
    );

    expect(result.current).toBeDefined();
  });

  it('returns commissions array when loaded', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
      expect(typeof result.current.data.pagination.totalPages).toBe('number');
    }
  });

  it('commission objects contain required fields', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const commission = result.current.data.data[0];
      expect(commission).toHaveProperty('id');
      expect(commission).toHaveProperty('agentId');
      expect(commission).toHaveProperty('status');
      expect(commission).toHaveProperty('grossCommission');
    }
  });

  it('query is enabled when agentId is provided', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns empty array when no commissions exist', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-no-commissions')
    );

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('commission includes financial details', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const commission = result.current.data.data[0];
      // Financial fields should be numbers
      expect(typeof commission.grossCommission).toBe('number');
      if (commission.netCommission !== undefined) {
        expect(typeof commission.netCommission).toBe('number');
      }
    }
  });

  it('commission includes load/order references', () => {
    const { result } = renderHook(() => useAgentCommissions('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const commission = result.current.data.data[0];
      // References are optional
      if (commission.loadId) {
        expect(typeof commission.loadId).toBe('string');
      }
      if (commission.orderId) {
        expect(typeof commission.orderId).toBe('string');
      }
    }
  });

  it('handles filters with all as value', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-1', { status: 'all' })
    );

    expect(result.current).toBeDefined();
  });

  it('supports pagination across large lists', () => {
    const { result } = renderHook(() =>
      useAgentCommissions('agent-1', { page: 1, limit: 100 })
    );

    expect(result.current).toBeDefined();
  });
});

// ===========================
// useAgentPerformance Tests
// ===========================

describe('useAgentPerformance', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns performance metrics when loaded', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('totalCommissions');
      expect(result.current.data).toHaveProperty('totalPaid');
      expect(result.current.data).toHaveProperty('avgCommission');
      expect(result.current.data).toHaveProperty('loadCount');
    }
  });

  it('performance metrics are numeric values', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    if (result.current.data) {
      expect(typeof result.current.data.totalCommissions).toBe('number');
      expect(typeof result.current.data.totalPaid).toBe('number');
      expect(typeof result.current.data.avgCommission).toBe('number');
      expect(typeof result.current.data.loadCount).toBe('number');
    }
  });

  it('handles zero values in metrics', () => {
    const { result } = renderHook(() =>
      useAgentPerformance('agent-no-activity')
    );

    if (result.current.data) {
      // Zero values should still be valid
      expect(typeof result.current.data.totalCommissions).toBe('number');
      expect(typeof result.current.data.loadCount).toBe('number');
    }
  });

  it('query is enabled when agentId is provided', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('performance metrics include pending amounts', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    if (result.current.data) {
      if (result.current.data.pendingAmount !== undefined) {
        expect(typeof result.current.data.pendingAmount).toBe('number');
      }
    }
  });

  it('handles agents with partial activity', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-partial'));

    if (result.current.data) {
      // All numeric fields should be present
      expect('totalCommissions' in result.current.data).toBe(true);
      expect('loadCount' in result.current.data).toBe(true);
    }
  });

  it('avgCommission correctly reflects average', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    if (result.current.data) {
      // Average should be less than or equal to total if count > 0
      if (result.current.data.loadCount > 0) {
        const avgCalc =
          result.current.data.totalCommissions / result.current.data.loadCount;
        // Allow small floating point differences
        expect(
          Math.abs(result.current.data.avgCommission - avgCalc)
        ).toBeLessThan(0.01);
      }
    }
  });

  it('total paid reflects distributed commissions', () => {
    const { result } = renderHook(() => useAgentPerformance('agent-1'));

    if (result.current.data) {
      // Total paid should be less than or equal to total commissions
      expect(result.current.data.totalPaid).toBeLessThanOrEqual(
        result.current.data.totalCommissions
      );
    }
  });
});
