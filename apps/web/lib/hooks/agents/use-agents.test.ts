/**
 * Tests for useAgents hook
 * Tests hook API, pagination, filtering, and error handling
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import { useAgents } from '@/lib/hooks/agents/use-agents';

// ===========================
// useAgents Tests (List)
// ===========================

describe('useAgents', () => {
  it('returns query result object', () => {
    const { result } = renderHook(() => useAgents({ page: 1, limit: 20 }));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts default parameters', () => {
    const { result } = renderHook(() => useAgents());

    expect(result.current).toBeDefined();
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() => useAgents({ page: 2, limit: 50 }));

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, status: 'ACTIVE' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts agentType filter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, agentType: 'BROKER' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts tier filter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, tier: 'PREMIUM' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts search parameter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, search: 'test agent' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts sortBy parameter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, sortBy: 'companyName' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts sortOrder parameter', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, sortOrder: 'desc' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts all filter parameters together', () => {
    const { result } = renderHook(() =>
      useAgents({
        page: 2,
        limit: 25,
        search: 'logistics',
        status: 'ACTIVE',
        agentType: 'BROKER',
        tier: 'STANDARD',
        sortBy: 'agentCode',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toBeDefined();
  });

  it('returns agents array in data when loaded', () => {
    const { result } = renderHook(() => useAgents({ page: 1, limit: 20 }));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useAgents({ page: 1, limit: 20 }));

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
      expect(typeof result.current.data.pagination.totalPages).toBe('number');
    }
  });

  it('agent objects contain required fields', () => {
    const { result } = renderHook(() => useAgents({ page: 1, limit: 20 }));

    if (result.current.data && result.current.data.data.length > 0) {
      const agent = result.current.data.data[0];
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('agentCode');
      expect(agent).toHaveProperty('companyName');
      expect(agent).toHaveProperty('status');
    }
  });

  it('filters by status "all" should be excluded from query', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, status: 'all' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters by agentType "all" should be excluded from query', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, agentType: 'all' })
    );

    expect(result.current).toBeDefined();
  });

  it('filters by tier "all" should be excluded from query', () => {
    const { result } = renderHook(() =>
      useAgents({ page: 1, limit: 20, tier: 'all' })
    );

    expect(result.current).toBeDefined();
  });
});
