/**
 * Manual mock for @/lib/hooks/load-board
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_LOAD_BOARD_MOCK__";

interface MockState {
    dashboardStats: Record<string, unknown>;
    recentPostings: Record<string, unknown>;
    postings: Record<string, unknown>;
    searchPostings: Record<string, unknown>;
    posting: Record<string, unknown>;
    createPosting: Record<string, unknown>;
    updatePosting: Record<string, unknown>;
    cancelPosting: Record<string, unknown>;
    bids: Record<string, unknown>;
    acceptBid: Record<string, unknown>;
    rejectBid: Record<string, unknown>;
    counterBid: Record<string, unknown>;
    carrierMatches: Record<string, unknown>;
    tenderToCarrier: Record<string, unknown>;
}

function getShared(): MockState {
    const g = globalThis as unknown as Record<string, MockState>;
    if (!g[KEY]) {
        g[KEY] = {
            dashboardStats: {
                data: undefined,
                isLoading: true,
            },
            recentPostings: {
                data: undefined,
                isLoading: true,
            },
            postings: {
                data: undefined,
                isLoading: true,
                isError: false,
                refetch: jest.fn(),
            },
            searchPostings: {
                data: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
            },
            posting: {
                data: undefined,
                isLoading: true,
            },
            createPosting: {
                mutateAsync: jest
                    .fn<() => Promise<unknown>>()
                    .mockResolvedValue({ id: "new-posting" }),
                isPending: false,
            },
            updatePosting: {
                mutate: jest.fn(),
                isPending: false,
            },
            cancelPosting: {
                mutate: jest.fn(),
                isPending: false,
            },
            bids: {
                data: undefined,
                isLoading: true,
            },
            acceptBid: {
                mutate: jest.fn(),
                isPending: false,
            },
            rejectBid: {
                mutate: jest.fn(),
                isPending: false,
            },
            counterBid: {
                mutate: jest.fn(),
                isPending: false,
            },
            carrierMatches: {
                data: undefined,
                isLoading: true,
            },
            tenderToCarrier: {
                mutate: jest.fn(),
                isPending: false,
            },
        };
    }
    return (globalThis as unknown as Record<string, MockState>)[KEY]!;
}

const shared = getShared();

export const dashboardStatsReturn = shared.dashboardStats;
export const recentPostingsReturn = shared.recentPostings;
export const postingsReturn = shared.postings;
export const searchPostingsReturn = shared.searchPostings;
export const postingReturn = shared.posting;
export const createPostingReturn = shared.createPosting;
export const updatePostingReturn = shared.updatePosting;
export const cancelPostingReturn = shared.cancelPosting;
export const bidsReturn = shared.bids;
export const acceptBidReturn = shared.acceptBid;
export const rejectBidReturn = shared.rejectBid;
export const counterBidReturn = shared.counterBid;
export const carrierMatchesReturn = shared.carrierMatches;
export const tenderToCarrierReturn = shared.tenderToCarrier;

// Query key exports
export const dashboardKeys = {
    all: ["load-board-dashboard"] as const,
    stats: () => ["load-board-dashboard", "stats"] as const,
    recent: () => ["load-board-dashboard", "recent"] as const,
};

export const postingKeys = {
    all: ["load-postings"] as const,
    lists: () => ["load-postings", "list"] as const,
    list: (params: unknown) => ["load-postings", "list", params] as const,
    details: () => ["load-postings", "detail"] as const,
    detail: (id: string) => ["load-postings", "detail", id] as const,
    bids: (postingId: string) => ["load-postings", "bids", postingId] as const,
    matches: (postingId: string) =>
        ["load-postings", "matches", postingId] as const,
};

// Hook exports (return mock state)
export function useLoadBoardDashboardStats() {
    return shared.dashboardStats;
}

export function useRecentPostings() {
    return shared.recentPostings;
}

export function usePostings() {
    return shared.postings;
}

export function useSearchPostings() {
    return shared.searchPostings;
}

export function usePosting() {
    return shared.posting;
}

export function useCreatePosting() {
    return shared.createPosting;
}

export function useUpdatePosting() {
    return shared.updatePosting;
}

export function useCancelPosting() {
    return shared.cancelPosting;
}

export function useBids() {
    return shared.bids;
}

export function useAcceptBid() {
    return shared.acceptBid;
}

export function useRejectBid() {
    return shared.rejectBid;
}

export function useCounterBid() {
    return shared.counterBid;
}

export function useCarrierMatches() {
    return shared.carrierMatches;
}

export function useTenderToCarrier() {
    return shared.tenderToCarrier;
}
