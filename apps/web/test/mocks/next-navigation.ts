/**
 * Manual mock for next/navigation
 *
 * Used by moduleNameMapper in jest.config.ts to replace the real
 * next/navigation module. Uses globalThis to guarantee shared state
 * across ESM module instances.
 *
 * Tests can override behavior via the exported jest.fn() mocks:
 *   import { mockPush } from "@/test/mocks/next-navigation";
 *   mockPush.mockImplementation(() => { ... });
 */
import { jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// Shared state via globalThis (survives ESM module duplication)
// ---------------------------------------------------------------------------

const KEY = "__NEXT_NAV_MOCK__";

function getShared() {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      push: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      forward: jest.fn(),
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const mockPush = shared.push;
export const mockBack = shared.back;
export const mockRefresh = shared.refresh;
export const mockReplace = shared.replace;
export const mockPrefetch = shared.prefetch;
export const mockForward = shared.forward;

export function useRouter() {
  const s = getShared();
  return {
    push: s.push,
    back: s.back,
    refresh: s.refresh,
    replace: s.replace,
    prefetch: s.prefetch,
    forward: s.forward,
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function usePathname() {
  return "/";
}

export function useParams() {
  return {};
}

export function useSelectedLayoutSegment() {
  return null;
}

export function useSelectedLayoutSegments() {
  return [];
}

export function redirect(url: string) {
  getShared().push(url);
}

export function notFound() {
  throw new Error("NEXT_NOT_FOUND");
}
