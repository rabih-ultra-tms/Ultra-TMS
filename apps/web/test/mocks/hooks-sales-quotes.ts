/**
 * Manual mock for @/lib/hooks/sales/use-quotes
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_SALES_QUOTES_MOCK__";

interface MockState {
  quotes: Record<string, unknown>;
  quote: Record<string, unknown>;
  quoteStats: Record<string, unknown>;
  deleteQuote: Record<string, unknown>;
  cloneQuote: Record<string, unknown>;
  sendQuote: Record<string, unknown>;
  convertQuote: Record<string, unknown>;
  quoteVersions: Record<string, unknown>;
  quoteTimeline: Record<string, unknown>;
  quoteNotes: Record<string, unknown>;
  addQuoteNote: Record<string, unknown>;
  acceptQuote: Record<string, unknown>;
  rejectQuote: Record<string, unknown>;
  createQuoteVersion: Record<string, unknown>;
  createQuote: Record<string, unknown>;
  updateQuote: Record<string, unknown>;
  calculateRate: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      quotes: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      quote: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      quoteStats: {
        data: undefined,
        isLoading: true,
      },
      deleteQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        isPending: false,
      },
      cloneQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      sendQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      convertQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      quoteVersions: {
        data: undefined,
        isLoading: true,
      },
      quoteTimeline: {
        data: undefined,
        isLoading: true,
      },
      quoteNotes: {
        data: undefined,
        isLoading: true,
      },
      addQuoteNote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      acceptQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      rejectQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      createQuoteVersion: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      createQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      updateQuote: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      calculateRate: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const quotesReturn = shared.quotes;
export const quoteReturn = shared.quote;
export const quoteStatsReturn = shared.quoteStats;
export const deleteQuoteReturn = shared.deleteQuote;
export const cloneQuoteReturn = shared.cloneQuote;
export const sendQuoteReturn = shared.sendQuote;
export const convertQuoteReturn = shared.convertQuote;
export const quoteVersionsReturn = shared.quoteVersions;
export const quoteTimelineReturn = shared.quoteTimeline;
export const quoteNotesReturn = shared.quoteNotes;
export const addQuoteNoteReturn = shared.addQuoteNote;
export const acceptQuoteReturn = shared.acceptQuote;
export const rejectQuoteReturn = shared.rejectQuote;
export const createQuoteVersionReturn = shared.createQuoteVersion;
export const createQuoteReturn = shared.createQuote;
export const updateQuoteReturn = shared.updateQuote;
export const calculateRateReturn = shared.calculateRate;

export function useQuotes() {
  return shared.quotes;
}
export function useQuote() {
  return shared.quote;
}
export function useQuoteStats() {
  return shared.quoteStats;
}
export function useDeleteQuote() {
  return shared.deleteQuote;
}
export function useCloneQuote() {
  return shared.cloneQuote;
}
export function useSendQuote() {
  return shared.sendQuote;
}
export function useConvertQuote() {
  return shared.convertQuote;
}
export function useQuoteVersions() {
  return shared.quoteVersions;
}
export function useQuoteTimeline() {
  return shared.quoteTimeline;
}
export function useQuoteNotes() {
  return shared.quoteNotes;
}
export function useAddQuoteNote() {
  return shared.addQuoteNote;
}
export function useAcceptQuote() {
  return shared.acceptQuote;
}
export function useRejectQuote() {
  return shared.rejectQuote;
}
export function useCreateQuoteVersion() {
  return shared.createQuoteVersion;
}
export function useCreateQuote() {
  return shared.createQuote;
}
export function useUpdateQuote() {
  return shared.updateQuote;
}
export function useCalculateRate() {
  return shared.calculateRate;
}
