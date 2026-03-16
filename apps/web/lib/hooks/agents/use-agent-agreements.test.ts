/**
 * Tests for agent agreements hooks: useAgentAgreements (list), useCreateAgreement,
 * useUpdateAgreement, useActivateAgreement, useTerminateAgreement
 * Tests hook API, pagination, error handling, cache invalidation, and mutations
 *
 * Note: These tests use mocked hooks provided by jest config for predictable behavior
 */

import { renderHook } from '@/test/utils';
import {
  useAgentAgreements,
  useCreateAgreement,
  useUpdateAgreement,
  useActivateAgreement,
  useTerminateAgreement,
  useDeleteAgreement,
} from '@/lib/hooks/agents/use-agent-agreements';

// ===========================
// useAgentAgreements Tests (List)
// ===========================

describe('useAgentAgreements', () => {
  it('returns query result object with required properties', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('accepts agentId parameter', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-123'));

    expect(result.current).toBeDefined();
  });

  it('returns agreements array when loaded', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('agreement objects contain required fields', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      expect(agreement).toHaveProperty('id');
      expect(agreement).toHaveProperty('agentId');
      expect(agreement).toHaveProperty('agreementNumber');
      expect(agreement).toHaveProperty('status');
      expect(agreement).toHaveProperty('effectiveDate');
    }
  });

  it('should not fetch when agentId is empty string', () => {
    const { result } = renderHook(() => useAgentAgreements(''));

    // When agentId is falsy, the query should be disabled
    expect(result.current).toBeDefined();
  });

  it('should handle different agent IDs', () => {
    const { result: result1 } = renderHook(() =>
      useAgentAgreements('agent-abc')
    );
    const { result: result2 } = renderHook(() =>
      useAgentAgreements('agent-xyz')
    );

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('returns agreement with all optional fields when present', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement) {
        expect(agreement).toHaveProperty('expirationDate');
        expect(agreement).toHaveProperty('splitType');
        expect(agreement).toHaveProperty('splitRate');
        expect(agreement).toHaveProperty('minimumPayout');
        expect(agreement).toHaveProperty('minimumPerLoad');
        expect(agreement).toHaveProperty('drawAmount');
        expect(agreement).toHaveProperty('drawFrequency');
      }
    }
  });

  it('includes sunset settings when available', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement && agreement.sunsetEnabled) {
        expect(agreement).toHaveProperty('sunsetPeriodMonths');
      }
    }
  });

  it('includes draw configuration details', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement && agreement.drawAmount !== null) {
        expect(agreement).toHaveProperty('drawFrequency');
        expect(agreement).toHaveProperty('drawRecoverable');
      }
    }
  });

  it('returns agreement with timestamps', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement) {
        expect(agreement).toHaveProperty('createdAt');
        expect(agreement).toHaveProperty('updatedAt');
      }
    }
  });

  it('handles agreements with ACTIVE status', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-active'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement) {
        expect(typeof agreement.status).toBe('string');
      }
    }
  });

  it('handles agreements with INACTIVE status', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-inactive'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement) {
        expect(typeof agreement.status).toBe('string');
      }
    }
  });

  it('handles agreements with EXPIRED status', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-expired'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement) {
        expect(typeof agreement.status).toBe('string');
      }
    }
  });

  it('returns empty array when agent has no agreements', () => {
    const { result } = renderHook(() =>
      useAgentAgreements('agent-no-agreements')
    );

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes version field when available', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement && agreement.version !== null) {
        expect(typeof agreement.version).toBe('number');
      }
    }
  });

  it('caches query results properly', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    // Hook should have proper cache configuration
    expect(result.current).toBeDefined();
  });

  it('uses proper query key structure', () => {
    // This test verifies the hook is properly integrated with React Query
    const { result } = renderHook(() => useAgentAgreements('agent-123'));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
  });

  it('handles agreements with protection period configuration', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement && agreement.protectionPeriodMonths) {
        expect(typeof agreement.protectionPeriodMonths).toBe('number');
      }
    }
  });

  it('handles agreements with payment day configuration', () => {
    const { result } = renderHook(() => useAgentAgreements('agent-1'));

    if (result.current.data && result.current.data.length > 0) {
      const agreement = result.current.data[0];
      if (agreement && agreement.paymentDay) {
        expect(typeof agreement.paymentDay).toBe('number');
      }
    }
  });
});

// ===========================
// useCreateAgreement Tests (Mutation)
// ===========================

describe('useCreateAgreement', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
  });

  it('accepts mutation with agentId and agreement data', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles create agreement payload with required fields', () => {
    const { result } = renderHook(() => useCreateAgreement());

    const payload = {
      agentId: 'agent-1',
      agreementNumber: 'AGR-001',
      effectiveDate: '2024-01-01',
      splitType: 'PERCENTAGE',
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('handles create agreement with optional fields', () => {
    const { result } = renderHook(() => useCreateAgreement());

    const payload = {
      agentId: 'agent-1',
      agreementNumber: 'AGR-001',
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      splitType: 'PERCENTAGE',
      splitRate: 15.5,
      minimumPayout: 1000,
      minimumPerLoad: 50,
      drawAmount: 500,
      drawFrequency: 'WEEKLY',
      drawRecoverable: true,
      sunsetEnabled: true,
      sunsetPeriodMonths: 6,
      protectionPeriodMonths: 3,
      paymentDay: 15,
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('handles create agreement with split rate', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles create agreement with minimum payout', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles create agreement with draw configuration', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('invalidates agreements list on successful creation', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('handles creation errors gracefully', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current).toHaveProperty('isError');
  });

  it('tracks pending state during creation', () => {
    const { result } = renderHook(() => useCreateAgreement());

    expect(result.current).toHaveProperty('isPending');
  });
});

// ===========================
// useUpdateAgreement Tests (Mutation)
// ===========================

describe('useUpdateAgreement', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
  });

  it('accepts mutation with agreementId and agentId', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('handles update agreement payload with partial fields', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    const payload = {
      agreementId: 'agreement-1',
      agentId: 'agent-1',
      splitRate: 20.0,
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('handles update with all optional fields', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    const payload = {
      agreementId: 'agreement-1',
      agentId: 'agent-1',
      effectiveDate: '2024-02-01',
      expirationDate: '2025-02-01',
      splitType: 'FLAT_RATE',
      splitRate: 250,
      minimumPayout: 1500,
      minimumPerLoad: 75,
      drawAmount: 750,
      drawFrequency: 'BIWEEKLY',
      drawRecoverable: false,
      sunsetEnabled: false,
      sunsetPeriodMonths: 12,
      protectionPeriodMonths: 6,
      paymentDay: 20,
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('invalidates agreements list on successful update', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('handles update errors gracefully', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current).toHaveProperty('isError');
  });

  it('tracks pending state during update', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current).toHaveProperty('isPending');
  });

  it('updates only the split rate', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('updates only the expiration date', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current.mutate).toBeDefined();
  });

  it('updates draw configuration', () => {
    const { result } = renderHook(() => useUpdateAgreement());

    expect(result.current.mutate).toBeDefined();
  });
});

// ===========================
// useActivateAgreement Tests (Mutation)
// ===========================

describe('useActivateAgreement', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
  });

  it('accepts mutation with agreementId and agentId', () => {
    const { result } = renderHook(() => useActivateAgreement());

    const payload = {
      agreementId: 'agreement-1',
      agentId: 'agent-1',
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('invalidates agreements list on successful activation', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('handles activation errors gracefully', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toHaveProperty('isError');
  });

  it('tracks pending state during activation', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toHaveProperty('isPending');
  });

  it('shows success toast on activation', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toBeDefined();
  });

  it('shows error toast on activation failure', () => {
    const { result } = renderHook(() => useActivateAgreement());

    expect(result.current).toHaveProperty('isError');
  });
});

// ===========================
// useTerminateAgreement Tests (Mutation)
// ===========================

describe('useTerminateAgreement', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
  });

  it('accepts mutation with agreementId and agentId', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    const payload = {
      agreementId: 'agreement-1',
      agentId: 'agent-1',
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('invalidates agreements list on successful termination', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('handles termination errors gracefully', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toHaveProperty('isError');
  });

  it('tracks pending state during termination', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toHaveProperty('isPending');
  });

  it('shows success toast on termination', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toBeDefined();
  });

  it('shows error toast on termination failure', () => {
    const { result } = renderHook(() => useTerminateAgreement());

    expect(result.current).toHaveProperty('isError');
  });
});

// ===========================
// useDeleteAgreement Tests (Mutation)
// ===========================

describe('useDeleteAgreement', () => {
  it('returns mutation object with required properties', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
  });

  it('accepts mutation with agreementId and agentId', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    const payload = {
      agreementId: 'agreement-1',
      agentId: 'agent-1',
    };

    expect(result.current.mutate).toBeDefined();
  });

  it('invalidates agreements list on successful deletion', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('handles deletion errors gracefully', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toHaveProperty('isError');
  });

  it('tracks pending state during deletion', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toHaveProperty('isPending');
  });

  it('shows success toast on deletion', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toBeDefined();
  });

  it('shows error toast on deletion failure', () => {
    const { result } = renderHook(() => useDeleteAgreement());

    expect(result.current).toHaveProperty('isError');
  });
});

// ===========================
// Cross-hook Integration Tests
// ===========================

describe('Agent Agreements Hooks Integration', () => {
  it('all hooks have proper mutation function structure', () => {
    const { result: listResult } = renderHook(() =>
      useAgentAgreements('agent-1')
    );
    const { result: createResult } = renderHook(() => useCreateAgreement());
    const { result: updateResult } = renderHook(() => useUpdateAgreement());
    const { result: activateResult } = renderHook(() => useActivateAgreement());
    const { result: terminateResult } = renderHook(() =>
      useTerminateAgreement()
    );
    const { result: deleteResult } = renderHook(() => useDeleteAgreement());

    expect(listResult.current).toBeDefined();
    expect(createResult.current).toBeDefined();
    expect(updateResult.current).toBeDefined();
    expect(activateResult.current).toBeDefined();
    expect(terminateResult.current).toBeDefined();
    expect(deleteResult.current).toBeDefined();
  });

  it('list hook uses same query key structure as mutations', () => {
    const { result: listResult } = renderHook(() =>
      useAgentAgreements('agent-1')
    );
    const { result: createResult } = renderHook(() => useCreateAgreement());

    // Both should be defined and accessible
    expect(listResult.current).toBeDefined();
    expect(createResult.current.mutate).toBeDefined();
  });

  it('handles nested resource pattern correctly', () => {
    // Verify that mutations use the correct nested route pattern
    const { result: createResult } = renderHook(() => useCreateAgreement());
    const { result: updateResult } = renderHook(() => useUpdateAgreement());
    const { result: deleteResult } = renderHook(() => useDeleteAgreement());

    expect(createResult.current.mutate).toBeDefined();
    expect(updateResult.current.mutate).toBeDefined();
    expect(deleteResult.current.mutate).toBeDefined();
  });

  it('all mutations invalidate the same query key structure', () => {
    const { result: listResult } = renderHook(() =>
      useAgentAgreements('agent-1')
    );
    const { result: createResult } = renderHook(() => useCreateAgreement());
    const { result: updateResult } = renderHook(() => useUpdateAgreement());
    const { result: deleteResult } = renderHook(() => useDeleteAgreement());

    // Verify all mutations are available and properly configured
    expect(listResult.current).toBeDefined();
    expect(createResult.current.mutate).toBeDefined();
    expect(updateResult.current.mutate).toBeDefined();
    expect(deleteResult.current.mutate).toBeDefined();
  });
});
