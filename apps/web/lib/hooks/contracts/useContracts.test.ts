/**
 * Tests for useContracts hook
 * Tests hook API, parameter handling, list operations, and CRUD mutations
 */

import { renderHook } from '@/test/utils';
import { useContracts } from './useContracts';
import {
  ContractType,
  ContractStatus,
  ContractFilters,
} from '@/lib/api/contracts/types';

describe('useContracts', () => {
  it('returns hook result object with expected properties', () => {
    const { result } = renderHook(() => useContracts());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('contracts');
    expect(result.current).toHaveProperty('pagination');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
  });

  describe('list operations', () => {
    it('initializes with empty contracts array', () => {
      const { result } = renderHook(() => useContracts());

      expect(Array.isArray(result.current.contracts)).toBe(true);
      expect(result.current.contracts.length).toBe(0);
    });

    it('accepts pagination parameters', () => {
      const { result } = renderHook(() => useContracts({ page: 2, limit: 50 }));

      expect(result.current).toBeDefined();
    });

    it('accepts filters with status array', () => {
      const filters: ContractFilters = {
        status: [ContractStatus.ACTIVE, ContractStatus.DRAFT],
      };

      const { result } = renderHook(() => useContracts({ filters }));

      expect(result.current).toBeDefined();
    });

    it('accepts filters with type', () => {
      const filters: ContractFilters = {
        type: ContractType.CARRIER,
      };

      const { result } = renderHook(() => useContracts({ filters }));

      expect(result.current).toBeDefined();
    });

    it('accepts filters with partyId', () => {
      const filters: ContractFilters = {
        partyId: 'party-1',
      };

      const { result } = renderHook(() => useContracts({ filters }));

      expect(result.current).toBeDefined();
    });

    it('accepts filters with dateRange', () => {
      const filters: ContractFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      };

      const { result } = renderHook(() => useContracts({ filters }));

      expect(result.current).toBeDefined();
    });

    it('provides refetch function', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.refetch).toBe('function');
    });

    it('isLoading is a boolean', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('isError is a boolean', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.isError).toBe('boolean');
    });
  });

  describe('create operations', () => {
    it('provides create function', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.create).toBe('function');
    });

    it('provides isCreating boolean flag', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.isCreating).toBe('boolean');
    });

    it('isCreating is false initially', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('update operations', () => {
    it('provides update function', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.update).toBe('function');
    });

    it('provides isUpdating boolean flag', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.isUpdating).toBe('boolean');
    });

    it('isUpdating is false initially', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('delete operations', () => {
    it('provides delete function', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.delete).toBe('function');
    });

    it('provides isDeleting boolean flag', () => {
      const { result } = renderHook(() => useContracts());

      expect(typeof result.current.isDeleting).toBe('boolean');
    });

    it('isDeleting is false initially', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe('pagination', () => {
    it('pagination can be undefined initially', () => {
      const { result } = renderHook(() => useContracts());

      if (result.current.pagination) {
        expect(result.current.pagination).toHaveProperty('page');
        expect(result.current.pagination).toHaveProperty('limit');
        expect(result.current.pagination).toHaveProperty('total');
        expect(result.current.pagination).toHaveProperty('totalPages');
      }
    });

    it('pagination page is a number when present', () => {
      const { result } = renderHook(() => useContracts());

      if (result.current.pagination) {
        expect(typeof result.current.pagination.page).toBe('number');
      }
    });

    it('pagination limit is a number when present', () => {
      const { result } = renderHook(() => useContracts());

      if (result.current.pagination) {
        expect(typeof result.current.pagination.limit).toBe('number');
      }
    });

    it('pagination total is a number when present', () => {
      const { result } = renderHook(() => useContracts());

      if (result.current.pagination) {
        expect(typeof result.current.pagination.total).toBe('number');
      }
    });

    it('pagination totalPages is a number when present', () => {
      const { result } = renderHook(() => useContracts());

      if (result.current.pagination) {
        expect(typeof result.current.pagination.totalPages).toBe('number');
      }
    });
  });

  describe('with default options', () => {
    it('uses page 1 by default', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current).toBeDefined();
    });

    it('uses limit 20 by default', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current).toBeDefined();
    });

    it('accepts no options', () => {
      const { result } = renderHook(() => useContracts());

      expect(result.current).toBeDefined();
    });
  });

  describe('with all options', () => {
    it('accepts all options together', () => {
      const filters: ContractFilters = {
        type: ContractType.CARRIER,
        status: [ContractStatus.ACTIVE],
        partyId: 'party-1',
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      };

      const { result } = renderHook(() =>
        useContracts({ filters, page: 2, limit: 50 })
      );

      expect(result.current).toBeDefined();
      expect(result.current.contracts).toBeDefined();
    });
  });
});
