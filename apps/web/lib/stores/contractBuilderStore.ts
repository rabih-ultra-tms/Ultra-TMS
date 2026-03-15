import { create } from 'zustand';
import { ContractType } from '@/lib/api/contracts/types';

export interface RateLaneFormData {
  id?: string;
  origin: string;
  destination: string;
  originZone?: string;
  destinationZone?: string;
  weight?: number;
  distance?: number;
  baseRate: number;
  markup?: number;
  discount?: number;
  minCharge?: number;
}

export interface RateTableFormData {
  id?: string;
  name: string;
  type: string;
  effectiveDate: string;
  expiryDate: string;
  baseCurrency: string;
  description?: string;
  lanes: RateLaneFormData[];
}

export interface SLAFormData {
  id?: string;
  name: string;
  description: string;
  deliveryTime: number;
  pickupTime: number;
  onTimePercentage: number;
  penalty?: number;
  reward?: number;
}

export interface VolumeCommitmentFormData {
  id?: string;
  commitmentPeriod: string;
  minVolume: number;
  maxVolume: number;
  volumeUnit: string;
  discountPercentage: number;
  penaltyPercentage?: number;
}

export interface ContractBuilderState {
  // Current step
  currentStep: number;

  // Step 1: Type & Parties
  contractType: ContractType | null;
  partyId: string;
  partyName: string;
  startDate: string;
  endDate: string;

  // Step 2: Terms
  currency: string;
  paymentTerms: string;
  incoterms: string;
  value: number;

  // Step 3: Rate Tables
  rateTables: RateTableFormData[];
  selectedRateTableIndex: number | null;

  // Step 4: SLAs & Volume
  slas: SLAFormData[];
  volumeCommitments: VolumeCommitmentFormData[];

  // Review & Submit
  isSubmitting: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setContractType: (type: ContractType) => void;
  setParty: (id: string, name: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setTerms: (currency: string, paymentTerms: string, incoterms: string, value: number) => void;
  addRateTable: (table: RateTableFormData) => void;
  updateRateTable: (index: number, table: RateTableFormData) => void;
  deleteRateTable: (index: number) => void;
  selectRateTable: (index: number | null) => void;
  addLaneToRateTable: (tableIndex: number, lane: RateLaneFormData) => void;
  updateLaneInRateTable: (
    tableIndex: number,
    laneIndex: number,
    lane: RateLaneFormData
  ) => void;
  deleteLaneFromRateTable: (tableIndex: number, laneIndex: number) => void;
  addSLA: (sla: SLAFormData) => void;
  updateSLA: (index: number, sla: SLAFormData) => void;
  deleteSLA: (index: number) => void;
  addVolumeCommitment: (commitment: VolumeCommitmentFormData) => void;
  updateVolumeCommitment: (index: number, commitment: VolumeCommitmentFormData) => void;
  deleteVolumeCommitment: (index: number) => void;
  setIsSubmitting: (submitting: boolean) => void;
  reset: () => void;

  // Get form data
  getFormData: () => Record<string, any>;
}

const initialState = {
  currentStep: 1,
  contractType: null,
  partyId: '',
  partyName: '',
  startDate: '',
  endDate: '',
  currency: 'USD',
  paymentTerms: '',
  incoterms: '',
  value: 0,
  rateTables: [],
  selectedRateTableIndex: null,
  slas: [],
  volumeCommitments: [],
  isSubmitting: false,
};

export const useContractBuilderStore = create<ContractBuilderState>((set, get) => ({
  ...initialState,

  setCurrentStep: (step: number) => set({ currentStep: step }),

  setContractType: (contractType: ContractType) => set({ contractType }),

  setParty: (partyId: string, partyName: string) =>
    set({ partyId, partyName }),

  setDates: (startDate: string, endDate: string) =>
    set({ startDate, endDate }),

  setTerms: (currency: string, paymentTerms: string, incoterms: string, value: number) =>
    set({ currency, paymentTerms, incoterms, value }),

  addRateTable: (table: RateTableFormData) =>
    set((state) => ({
      rateTables: [...state.rateTables, table],
    })),

  updateRateTable: (index: number, table: RateTableFormData) =>
    set((state) => ({
      rateTables: state.rateTables.map((t, i) => (i === index ? table : t)),
    })),

  deleteRateTable: (index: number) =>
    set((state) => ({
      rateTables: state.rateTables.filter((_, i) => i !== index),
      selectedRateTableIndex:
        state.selectedRateTableIndex === index
          ? null
          : state.selectedRateTableIndex,
    })),

  selectRateTable: (index: number | null) =>
    set({ selectedRateTableIndex: index }),

  addLaneToRateTable: (tableIndex: number, lane: RateLaneFormData) =>
    set((state) => ({
      rateTables: state.rateTables.map((table, i) =>
        i === tableIndex
          ? {
              ...table,
              lanes: [...table.lanes, lane],
            }
          : table
      ),
    })),

  updateLaneInRateTable: (
    tableIndex: number,
    laneIndex: number,
    lane: RateLaneFormData
  ) =>
    set((state) => ({
      rateTables: state.rateTables.map((table, i) =>
        i === tableIndex
          ? {
              ...table,
              lanes: table.lanes.map((l, j) =>
                j === laneIndex ? lane : l
              ),
            }
          : table
      ),
    })),

  deleteLaneFromRateTable: (tableIndex: number, laneIndex: number) =>
    set((state) => ({
      rateTables: state.rateTables.map((table, i) =>
        i === tableIndex
          ? {
              ...table,
              lanes: table.lanes.filter((_, j) => j !== laneIndex),
            }
          : table
      ),
    })),

  addSLA: (sla: SLAFormData) =>
    set((state) => ({
      slas: [...state.slas, sla],
    })),

  updateSLA: (index: number, sla: SLAFormData) =>
    set((state) => ({
      slas: state.slas.map((s, i) => (i === index ? sla : s)),
    })),

  deleteSLA: (index: number) =>
    set((state) => ({
      slas: state.slas.filter((_, i) => i !== index),
    })),

  addVolumeCommitment: (commitment: VolumeCommitmentFormData) =>
    set((state) => ({
      volumeCommitments: [...state.volumeCommitments, commitment],
    })),

  updateVolumeCommitment: (index: number, commitment: VolumeCommitmentFormData) =>
    set((state) => ({
      volumeCommitments: state.volumeCommitments.map((c, i) =>
        i === index ? commitment : c
      ),
    })),

  deleteVolumeCommitment: (index: number) =>
    set((state) => ({
      volumeCommitments: state.volumeCommitments.filter((_, i) => i !== index),
    })),

  setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),

  reset: () => set(initialState),

  getFormData: () => {
    const state = get();
    return {
      type: state.contractType,
      partyId: state.partyId,
      partyName: state.partyName,
      startDate: state.startDate,
      endDate: state.endDate,
      currency: state.currency,
      paymentTerms: state.paymentTerms,
      incoterms: state.incoterms,
      value: state.value,
      rateTables: state.rateTables,
      slas: state.slas,
      volumeCommitments: state.volumeCommitments,
    };
  },
}));
