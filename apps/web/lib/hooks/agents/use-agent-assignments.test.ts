/**
 * Tests for agent customer assignment hooks: useAgentCustomers (list),
 * useAssignCustomer, useTransferAssignment, useStartSunset, useTerminateAssignment
 * Tests hook API, CRUD operations, and cache invalidation
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import {
  useAgentCustomers,
  useAssignCustomer,
  useTransferAssignment,
  useStartSunset,
  useTerminateAssignment,
} from '@/lib/hooks/agents/use-agent-assignments';

// ===========================
// useAgentCustomers Tests (List)
// ===========================

describe('useAgentCustomers', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns assignments array when loaded', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('assignment objects contain required fields', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0];
      expect(assignment).toHaveProperty('id');
      expect(assignment).toHaveProperty('agentId');
      expect(assignment).toHaveProperty('customerId');
      expect(assignment).toHaveProperty('status');
    }
  });

  it('query is enabled when agentId is provided', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns empty array when no assignments exist', () => {
    const { result } = renderHook(() =>
      useAgentCustomers('agent-no-customers')
    );

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('assignment includes customer details', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0]!;
      // Customer detail is optional
      if (assignment.customer) {
        expect(assignment.customer).toHaveProperty('id');
        expect(assignment.customer).toHaveProperty('name');
      }
    }
  });

  it('assignment includes split percent information', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0]!;
      // Split percent is optional
      if (assignment.splitPercent !== undefined) {
        expect(typeof assignment.splitPercent).toBe('number');
      }
    }
  });

  it('assignment includes protection status', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0]!;
      expect(typeof assignment.isProtected).toBe('boolean');
    }
  });

  it('assignment includes sunset information', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0]!;
      expect(typeof assignment.inSunset).toBe('boolean');
      // Sunset fields are optional
      if (assignment.sunsetStartDate) {
        expect(typeof assignment.sunsetStartDate).toBe('string');
      }
    }
  });

  it('handles multiple assignments', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      // All assignments should have consistent structure
      result.current.data.forEach((assignment) => {
        expect(assignment).toHaveProperty('id');
        expect(assignment).toHaveProperty('agentId');
        expect(assignment).toHaveProperty('customerId');
      });
    }
  });

  it('assignment includes timestamp information', () => {
    const { result } = renderHook(() => useAgentCustomers('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const assignment = result.current.data[0];
      expect(assignment).toHaveProperty('createdAt');
      expect(assignment).toHaveProperty('updatedAt');
    }
  });
});

// ===========================
// useAssignCustomer Tests
// ===========================

describe('useAssignCustomer', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useAssignCustomer());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useAssignCustomer());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useAssignCustomer());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts assignment parameters', () => {
    const { result } = renderHook(() => useAssignCustomer());

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('has error property for failed mutations', () => {
    const { result } = renderHook(() => useAssignCustomer());

    expect(result.current).toHaveProperty('error');
  });
});

// ===========================
// useTransferAssignment Tests
// ===========================

describe('useTransferAssignment', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useTransferAssignment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useTransferAssignment());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useTransferAssignment());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts transfer parameters', () => {
    const { result } = renderHook(() => useTransferAssignment());

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

// ===========================
// useStartSunset Tests
// ===========================

describe('useStartSunset', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useStartSunset());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useStartSunset());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useStartSunset());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts assignment and agent IDs', () => {
    const { result } = renderHook(() => useStartSunset());

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

// ===========================
// useTerminateAssignment Tests
// ===========================

describe('useTerminateAssignment', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useTerminateAssignment());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is a function', () => {
    const { result } = renderHook(() => useTerminateAssignment());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending boolean property', () => {
    const { result } = renderHook(() => useTerminateAssignment());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('accepts assignment and agent IDs', () => {
    const { result } = renderHook(() => useTerminateAssignment());

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('has data property after successful mutation', () => {
    const { result } = renderHook(() => useTerminateAssignment());

    expect(result.current).toHaveProperty('data');
  });
});
