/**
 * Manual mock for @/lib/hooks/tms/use-rate-confirmation
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_RATE_CONFIRMATION_MOCK__";

interface MockState {
  rateConfirmation: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      rateConfirmation: {
        pdfUrl: null,
        generate: jest.fn(),
        isGenerating: false,
        generateError: null,
        emailToCarrier: jest.fn(),
        isEmailing: false,
        download: jest.fn(),
        cleanup: jest.fn(),
        hasGenerated: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const rateConfirmationReturn = shared.rateConfirmation;

export interface RateConfirmationOptions {
  includeAccessorials?: boolean;
  includeTerms?: boolean;
  customMessage?: string;
  sendToCarrier?: boolean;
}

export function useRateConfirmation() {
  return shared.rateConfirmation;
}
