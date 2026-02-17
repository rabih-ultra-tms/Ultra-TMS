/**
 * Manual mock for @/lib/hooks/communication/use-auto-email
 */
import { jest } from "@jest/globals";

export function useAutoEmail() {
  return {
    triggerEmail: jest.fn(),
    isTriggering: false,
  };
}

export function loadToEmailData(load: Record<string, unknown>) {
  return load;
}

export function dispatchLoadToEmailData(load: Record<string, unknown>) {
  return load;
}
