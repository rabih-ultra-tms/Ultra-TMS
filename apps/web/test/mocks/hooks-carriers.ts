/**
 * Manual mock for @/lib/hooks/carriers/*
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_CARRIERS_MOCK__";

interface MockState {
    fmcsaLookup: Record<string, unknown>;
    csaScores: Record<string, unknown>;
}

function getShared(): MockState {
    const g = globalThis as unknown as Record<string, MockState>;
    if (!g[KEY]) {
        g[KEY] = {
            fmcsaLookup: {
                mutate: jest.fn(),
                data: undefined,
                isPending: false,
                isError: false,
            },
            csaScores: {
                data: undefined,
                isLoading: true,
            },
        };
    }
    return (globalThis as unknown as Record<string, MockState>)[KEY]!;
}

const shared = getShared();

export const fmcsaLookupReturn = shared.fmcsaLookup;
export const csaScoresReturn = shared.csaScores;

// Hook exports
export const useFmcsaLookup = () => shared.fmcsaLookup;
export const useCsaScores = () => shared.csaScores;

// Type re-exports
export interface FmcsaCarrierRecord {
    id: string;
    tenantId: string;
    carrierId: string;
    dotNumber: string | null;
    mcNumber: string | null;
    legalName: string | null;
    dbaName: string | null;
    operatingStatus: "ACTIVE" | "INACTIVE" | "OUT_OF_SERVICE" | null;
    outOfServiceDate: string | null;
    commonAuthority: boolean;
    contractAuthority: boolean;
    brokerAuthority: boolean;
    physicalAddress: string | null;
    physicalCity: string | null;
    physicalState: string | null;
    physicalZip: string | null;
    phone: string | null;
    powerUnitCount: number | null;
    driverCount: number | null;
    lastSyncedAt: string | null;
}

export type CSABasicType =
    | "UNSAFE_DRIVING"
    | "HOS_COMPLIANCE"
    | "DRIVER_FITNESS"
    | "CONTROLLED_SUBSTANCES"
    | "VEHICLE_MAINTENANCE"
    | "HAZMAT_COMPLIANCE"
    | "CRASH_INDICATOR";

export interface CsaScore {
    id: string;
    carrierId: string;
    basicType: CSABasicType;
    score: number | null;
    percentile: number | null;
    threshold: number | null;
    isAboveThreshold: boolean;
    isAlert: boolean;
    inspectionCount: number;
    violationCount: number;
    oosViolationCount: number;
    asOfDate: string;
}
