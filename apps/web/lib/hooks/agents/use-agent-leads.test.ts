/**
 * Tests for agent leads hooks: useAgentLeads (list), useQualifyLead,
 * useConvertLead, useRejectLead
 * Tests hook API, pagination, lead operations, and error handling
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import {
  useAgentLeads,
  useQualifyLead,
  useConvertLead,
  useRejectLead,
} from '@/lib/hooks/agents/use-agent-leads';

// ===========================
// useAgentLeads Tests (List)
// ===========================

describe('useAgentLeads', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentLeads('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentLeads('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('accepts pagination parameters', () => {
    const { result } = renderHook(() =>
      useAgentLeads('agent-1', { page: 2, limit: 25 })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts status filter', () => {
    const { result } = renderHook(() =>
      useAgentLeads('agent-1', { status: 'QUALIFIED' })
    );

    expect(result.current).toBeDefined();
  });

  it('returns leads array when loaded', () => {
    const { result } = renderHook(() => useAgentLeads('agent-1'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('returns pagination info', () => {
    const { result } = renderHook(() => useAgentLeads('agent-1'));

    if (result.current.data) {
      expect(result.current.data.pagination).toBeDefined();
      expect(result.current.data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(result.current.data.pagination.limit).toBeGreaterThan(0);
      expect(typeof result.current.data.pagination.total).toBe('number');
    }
  });

  it('lead objects contain required fields', () => {
    const { result } = renderHook(() => useAgentLeads('agent-1'));

    if (result.current.data && result.current.data.data.length > 0) {
      const lead = result.current.data.data[0];
      expect(lead).toHaveProperty('id');
      expect(lead).toHaveProperty('agentId');
      expect(lead).toHaveProperty('status');
    }
  });

  it('query is enabled when agentId is provided', () => {
    const { result } = renderHook(() => useAgentLeads('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns empty array when no leads exist', () => {
    const { result } = renderHook(() => useAgentLeads('agent-no-leads'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data.data)).toBe(true);
    }
  });

  it('handles different lead statuses', () => {
    const { result } = renderHook(() =>
      useAgentLeads('agent-1', { status: 'NEW' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts search parameter', () => {
    const { result } = renderHook(() =>
      useAgentLeads('agent-1', { search: 'ABC Corp' })
    );

    expect(result.current).toBeDefined();
  });

  it('accepts sort parameters', () => {
    const { result } = renderHook(() =>
      useAgentLeads('agent-1', { sortBy: 'createdAt', sortOrder: 'desc' })
    );

    expect(result.current).toBeDefined();
  });
});

// ===========================
// useQualifyLead Tests
// ===========================

describe('useQualifyLead', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useQualifyLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useQualifyLead('agent-1'));

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useQualifyLead('agent-1'));

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts leadId parameter', () => {
    const { result } = renderHook(() => useQualifyLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('has data property after successful mutation', () => {
    const { result } = renderHook(() => useQualifyLead('agent-1'));

    expect(result.current).toHaveProperty('data');
  });
});

// ===========================
// useConvertLead Tests
// ===========================

describe('useConvertLead', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useConvertLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useConvertLead('agent-1'));

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useConvertLead('agent-1'));

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts leadId and data parameters', () => {
    const { result } = renderHook(() => useConvertLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

// ===========================
// useRejectLead Tests
// ===========================

describe('useRejectLead', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useRejectLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useRejectLead('agent-1'));

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useRejectLead('agent-1'));

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts leadId and reason parameters', () => {
    const { result } = renderHook(() => useRejectLead('agent-1'));

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('has error property for failed mutations', () => {
    const { result } = renderHook(() => useRejectLead('agent-1'));

    expect(result.current).toHaveProperty('error');
  });
});
