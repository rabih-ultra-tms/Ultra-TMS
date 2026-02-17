/**
 * Manual mock for @/lib/hooks
 *
 * Used by moduleNameMapper in jest.config.ts.
 */
import { jest } from "@jest/globals";

export function useDebounce<T>(value: T): T {
  return value; // No debounce in tests
}

export function usePagination(): { page: number; setPage: jest.Mock; pageSize: number } {
  return { page: 1, setPage: jest.fn(), pageSize: 25 };
}

export function useConfirm(): { confirm: jest.Mock<() => Promise<boolean>>; dialog: null } {
  return { confirm: jest.fn<() => Promise<boolean>>().mockResolvedValue(true), dialog: null };
}

export function useCurrentUser() {
  return {
    user: { id: "user-1", email: "test@example.com", name: "Test User" },
    isLoading: false,
  };
}

export function useLogin(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}

export function useLogout(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}

export function useHasPermission() {
  return true;
}

export function useHasRole() {
  return true;
}
