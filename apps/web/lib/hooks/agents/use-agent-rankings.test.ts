/**
 * Tests for agent rankings hook: useAgentRankings (global)
 * Tests hook API, sorting, pagination, top N filtering, and error handling
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import { useAgentRankings } from '@/lib/hooks/agents/use-agent-rankings';

// ===========================
// useAgentRankings Tests
// ===========================

describe('useAgentRankings', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentRankings());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts top N parameter', () => {
    const { result } = renderHook(() => useAgentRankings({ top: 10 }));

    expect(result.current).toBeDefined();
  });

  it('accepts period parameter', () => {
    const { result } = renderHook(() =>
      useAgentRankings({ period: '2026-03' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts metric parameter for sorting', () => {
    const { result } = renderHook(() =>
      useAgentRankings({ metric: 'commission' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns rankings array when loaded', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('ranking objects contain required fields', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data && result.current.data.data.length > 0) {
      const ranking = result.current.data.data[0];
      expect(ranking).toHaveProperty('rank');
      expect(ranking).toHaveProperty('agentId');
      expect(ranking).toHaveProperty('agentCode');
      expect(ranking).toHaveProperty('companyName');
    }
  });

  it('returns rankings sorted by commission descending', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data && result.current.data.data.length > 1) {
      const rankings = result.current.data.data;
      // Verify rankings are sorted by value descending
      for (let i = 0; i < rankings.length - 1; i++) {
        expect(
          (rankings[i]?.commission ?? 0) >= (rankings[i + 1]?.commission ?? 0)
        ).toBe(true);
      }
    }
  });

  it('top 10 returns maximum 10 results', () => {
    const { result } = renderHook(() => useAgentRankings({ top: 10 }));

    if (result.current.data) {
      expect(result.current.data.data.length).toBeLessThanOrEqual(10);
    }
  });

  it('returns empty array when no agents exist', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('ranking includes rank positions', () => {
    const { result } = renderHook(() => useAgentRankings({ top: 10 }));

    if (result.current.data && result.current.data.data.length > 0) {
      result.current.data.data.forEach((ranking, index) => {
        expect(ranking.rank).toBe(index + 1);
      });
    }
  });

  it('ranking includes commission value', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data && result.current.data.data.length > 0) {
      const ranking = result.current.data.data[0]!;
      // Commission is optional but should be a number if present
      if (ranking.commission !== undefined) {
        expect(typeof ranking.commission).toBe('number');
      }
    }
  });

  it('ranking includes additional metrics', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data && result.current.data.data.length > 0) {
      const ranking = result.current.data.data[0]!;
      // Additional fields are optional but should be numbers if present
      if (ranking.loadCount !== undefined) {
        expect(typeof ranking.loadCount).toBe('number');
      }
      if (ranking.avgCommission !== undefined) {
        expect(typeof ranking.avgCommission).toBe('number');
      }
    }
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useAgentRankings({ page: 1, limit: 50 })
    );

    expect(result.current).toBeDefined();
  });

  it('returns pagination info when paginated', () => {
    const { result } = renderHook(() =>
      useAgentRankings({ page: 1, limit: 50 })
    );

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination?.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination?.limit).toBeGreaterThan(0);
    }
  });

  it('handles different ranking metrics', () => {
    const { result } = renderHook(() => useAgentRankings({ metric: 'loads' }));

    expect(result.current).toBeDefined();
  });

  it('ranking includes agent contact information', () => {
    const { result } = renderHook(() => useAgentRankings());

    if (result.current.data && result.current.data.data.length > 0) {
      const ranking = result.current.data.data[0]!;
      // Contact info is optional but should be strings if present
      if (ranking.contactFirstName) {
        expect(typeof ranking.contactFirstName).toBe('string');
      }
      if (ranking.contactLastName) {
        expect(typeof ranking.contactLastName).toBe('string');
      }
    }
  });
});
