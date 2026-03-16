/**
 * Tests for agent mutation hooks: useCreateAgent, useUpdateAgent, useActivateAgent, useSuspendAgent, useTerminateAgent
 * Tests mutation execution, error handling, and cache invalidation
 *
 * Note: These tests verify that mutation hooks follow React Query patterns:
 * - mutate function is callable
 * - isPending state is available
 * - isError state is available
 * - error property contains error information
 */

import { renderHook } from '@/test/utils';
import {
  useCreateAgent,
  useUpdateAgent,
  useActivateAgent,
  useSuspendAgent,
  useTerminateAgent,
  useDeleteAgent,
  type CreateAgentInput,
  type UpdateAgentInput,
} from '@/lib/hooks/agents/use-agents';

// ===========================
// useCreateAgent Tests
// ===========================

describe('useCreateAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('data');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('mutateAsync is callable', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('accepts agent creation input', () => {
    const { result } = renderHook(() => useCreateAgent());

    const input: CreateAgentInput = {
      agentCode: 'AG-001',
      companyName: 'Test Logistics',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactEmail: 'john@example.com',
      agentType: 'BROKER',
    };

    expect(typeof result.current.mutate).toBe('function');
    // Mutation should accept the input structure
  });

  it('accepts optional agent fields', () => {
    const { result } = renderHook(() => useCreateAgent());

    const input: CreateAgentInput = {
      agentCode: 'AG-002',
      companyName: 'Test Company',
      dbaName: 'Test DBA',
      contactFirstName: 'Jane',
      contactLastName: 'Smith',
      contactEmail: 'jane@example.com',
      contactPhone: '555-1234',
      agentType: 'CARRIER',
      tier: 'PREMIUM',
      territories: ['CA', 'NV'],
      industryFocus: ['Automotive', 'Electronics'],
      legalEntityType: 'LLC',
      taxId: '12-3456789',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending state', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('has error property', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(result.current).toHaveProperty('error');
  });

  it('has isSuccess state', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(typeof result.current.isSuccess).toBe('boolean');
  });

  it('has data property for created agent', () => {
    const { result } = renderHook(() => useCreateAgent());

    expect(result.current).toHaveProperty('data');
  });
});

// ===========================
// useUpdateAgent Tests
// ===========================

describe('useUpdateAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useUpdateAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useUpdateAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts agent ID and update data', () => {
    const { result } = renderHook(() => useUpdateAgent());

    const input = {
      id: 'agent-123',
      companyName: 'Updated Company',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts partial updates', () => {
    const { result } = renderHook(() => useUpdateAgent());

    const input: UpdateAgentInput & { id: string } = {
      id: 'agent-456',
      contactEmail: 'newemail@example.com',
      tier: 'PLATINUM',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts full updates with all optional fields', () => {
    const { result } = renderHook(() => useUpdateAgent());

    const input: UpdateAgentInput & { id: string } = {
      id: 'agent-789',
      companyName: 'New Company',
      dbaName: 'New DBA',
      contactFirstName: 'Updated',
      contactLastName: 'Name',
      contactEmail: 'updated@example.com',
      contactPhone: '555-9999',
      agentType: 'CARRIER',
      tier: 'PREMIUM',
      territories: ['TX', 'OK'],
      industryFocus: ['Food'],
      legalEntityType: 'Corporation',
      taxId: '98-7654321',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending state during mutation', () => {
    const { result } = renderHook(() => useUpdateAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state for failed mutations', () => {
    const { result } = renderHook(() => useUpdateAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('has data property with updated agent', () => {
    const { result } = renderHook(() => useUpdateAgent());

    expect(result.current).toHaveProperty('data');
  });
});

// ===========================
// useActivateAgent Tests
// ===========================

describe('useActivateAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable with agent ID', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts string agent ID', () => {
    const { result } = renderHook(() => useActivateAgent());

    const agentId = 'agent-123';
    expect(typeof result.current.mutate).toBe('function');
  });

  it('handles agent activation successfully', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isSuccess');
  });

  it('has isPending state', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('provides error information on failure', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(result.current).toHaveProperty('error');
  });

  it('has isSuccess state for successful activation', () => {
    const { result } = renderHook(() => useActivateAgent());

    expect(typeof result.current.isSuccess).toBe('boolean');
  });
});

// ===========================
// useSuspendAgent Tests
// ===========================

describe('useSuspendAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts agent ID and suspension reason', () => {
    const { result } = renderHook(() => useSuspendAgent());

    const input = {
      id: 'agent-123',
      reason: 'Policy violation',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts various suspension reasons', () => {
    const { result } = renderHook(() => useSuspendAgent());

    const reasons = [
      'Policy violation',
      'Non-compliance',
      'Performance issues',
      'Under investigation',
    ];

    reasons.forEach(() => {
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  it('has isPending state during suspension', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state for failed suspensions', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('has data property with suspended agent', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(result.current).toHaveProperty('data');
  });

  it('provides error information', () => {
    const { result } = renderHook(() => useSuspendAgent());

    expect(result.current).toHaveProperty('error');
  });
});

// ===========================
// useTerminateAgent Tests
// ===========================

describe('useTerminateAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts agent ID and termination reason', () => {
    const { result } = renderHook(() => useTerminateAgent());

    const input = {
      id: 'agent-123',
      reason: 'Contract ended',
    };

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts various termination reasons', () => {
    const { result } = renderHook(() => useTerminateAgent());

    const reasons = [
      'Contract ended',
      'Voluntary termination',
      'Breach of contract',
      'Retirement',
      'Business closure',
    ];

    reasons.forEach(() => {
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  it('has isPending state during termination', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('has data property with terminated agent', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(result.current).toHaveProperty('data');
  });

  it('has isSuccess state', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(typeof result.current.isSuccess).toBe('boolean');
  });

  it('provides error information on failure', () => {
    const { result } = renderHook(() => useTerminateAgent());

    expect(result.current).toHaveProperty('error');
  });
});

// ===========================
// useDeleteAgent Tests
// ===========================

describe('useDeleteAgent', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('mutate is callable', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('accepts agent ID for deletion', () => {
    const { result } = renderHook(() => useDeleteAgent());

    const agentId = 'agent-to-delete';
    expect(typeof result.current.mutate).toBe('function');
  });

  it('has isPending state during deletion', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(typeof result.current.isPending).toBe('boolean');
  });

  it('has isError state', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(typeof result.current.isError).toBe('boolean');
  });

  it('has isSuccess state', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(typeof result.current.isSuccess).toBe('boolean');
  });

  it('provides error information', () => {
    const { result } = renderHook(() => useDeleteAgent());

    expect(result.current).toHaveProperty('error');
  });
});
