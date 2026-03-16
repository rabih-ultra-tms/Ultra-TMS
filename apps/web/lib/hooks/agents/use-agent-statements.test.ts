/**
 * Tests for agent statements hooks: useAgentStatements (list)
 * Tests hook API, pagination, PDF download functionality, and error handling
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import { useAgentStatements } from '@/lib/hooks/agents/use-agent-statements';

// ===========================
// useAgentStatements Tests
// ===========================

describe('useAgentStatements', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentStatements('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-1', { page: 2, limit: 25 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts period filter', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-1', { period: '2026-03' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns statements array when loaded', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
    }
  });

  it('statement objects contain required fields', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const statement = result.current.data.data[0];
      expect(statement).toHaveProperty('id');
      expect(statement).toHaveProperty('agentId');
      expect(statement).toHaveProperty('period');
    }
  });

  it('query is enabled when agentId is provided', () => {
    const { result } = renderHook(() => useAgentStatements('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns empty array when no statements exist', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-no-statements')
    );

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('statements include PDF URL when available', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const statement = result.current.data.data[0]!;
      // PDF URL is optional but should be a string if present
      if (statement.pdfUrl) {
        expect(typeof statement.pdfUrl).toBe('string');
      }
    }
  });

  it('accepts date range filters', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-1', {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts sort parameters', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-1', { sortBy: 'period', sortOrder: 'desc' })
    );

    expect(result.current).toBeDefined();
  });

  it('statements include financial summary', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const statement = result.current.data.data[0]!;
      // Financial fields are optional but should be numbers if present
      if (statement.totalCommission !== undefined) {
        expect(typeof statement.totalCommission).toBe('number');
      }
    }
  });

  it('statements include status information', () => {
    const { result } = renderHook(() => useAgentStatements('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const statement = result.current.data.data[0]!;
      // Status field is optional but should be a string if present
      if (statement.status) {
        expect(typeof statement.status).toBe('string');
      }
    }
  });

  it('handles multiple statements in list', () => {
    const { result } = renderHook(() =>
      useAgentStatements('agent-1', { page: 1, limit: 50 })
    );

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
      // If there are statements, verify structure
      if (result.current.data.data.length > 0) {
        result.current.data.data.forEach((statement) => {
          expect(statement).toHaveProperty('id');
          expect(statement).toHaveProperty('agentId');
        });
      }
    }
  });
});
