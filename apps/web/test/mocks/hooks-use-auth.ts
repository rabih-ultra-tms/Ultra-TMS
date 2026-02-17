/**
 * Manual mock for @/lib/hooks/use-auth
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_USE_AUTH_MOCK__";

interface MockState {
  currentUser: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      currentUser: {
        data: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          roles: [{ name: "Ops Manager" }],
          permissions: ["finance_view"],
        },
        isLoading: false,
        error: null,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const currentUserReturn = shared.currentUser;

export function useCurrentUser() {
  return shared.currentUser;
}

export function useLogin(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}

export function useLogout(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
