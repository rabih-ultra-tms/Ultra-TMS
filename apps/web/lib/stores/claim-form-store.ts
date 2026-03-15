/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createStore } from './create-store';
import { ClaimType } from '@/lib/api/claims/types';

/**
 * Claims form wizard state
 * Persists form data across step transitions
 */

export interface ClaimFormItem {
  id: string; // temporary client-side ID
  description: string;
  quantity: number;
  unitPrice: number;
  damageType?: string;
  damageExtent?: string;
}

export interface ClaimFormDocument {
  id: string; // temporary client-side ID
  file: any; // File object from input element
  name: string;
  size: number;
  type: string;
  documentType: string;
  isUploading?: boolean;
}

export interface ClaimFormState {
  // Step 1: Type & Incident
  claimType: ClaimType | '';
  incidentDate: string;
  incidentLocation: string;
  description: string;
  carrierId: string;
  orderId?: string;
  loadId?: string;

  // Step 2: Items
  items: ClaimFormItem[];

  // Step 3: Documentation
  documents: ClaimFormDocument[];

  // Step 4: Review (read-only, derived from steps 1-3)

  // Methods
  setClaimType: (type: ClaimType | '') => void;
  setIncidentDate: (date: string) => void;
  setIncidentLocation: (location: string) => void;
  setDescription: (desc: string) => void;
  setCarrierId: (id: string) => void;
  setOrderId: (id?: string) => void;
  setLoadId: (id?: string) => void;

  addItem: (item: Omit<ClaimFormItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<ClaimFormItem>) => void;
  removeItem: (id: string) => void;
  getItems: () => ClaimFormItem[];
  getItemsTotal: () => number;

  addDocument: (file: any, documentType: string) => void;
  updateDocument: (id: string, updates: Partial<ClaimFormDocument>) => void;
  removeDocument: (id: string) => void;
  getDocuments: () => ClaimFormDocument[];

  // Reset all form state
  reset: () => void;
}

const DEFAULT_STATE = {
  claimType: '' as ClaimType | '',
  incidentDate: '',
  incidentLocation: '',
  description: '',
  carrierId: '',
  orderId: undefined,
  loadId: undefined,
  items: [] as ClaimFormItem[],
  documents: [] as ClaimFormDocument[],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useClaimFormStore = createStore<ClaimFormState>(
  'claim-form-store',
  (set, get) => ({
    ...DEFAULT_STATE,

    setClaimType: (type) => set({ claimType: type }),
    setIncidentDate: (date) => set({ incidentDate: date }),
    setIncidentLocation: (location) => set({ incidentLocation: location }),
    setDescription: (desc) => set({ description: desc }),
    setCarrierId: (id) => set({ carrierId: id }),
    setOrderId: (id) => set({ orderId: id }),
    setLoadId: (id) => set({ loadId: id }),

    addItem: (item) => {
      const items = [...get().items, { ...item, id: generateId() }];
      set({ items });
    },

    updateItem: (id, item) => {
      const items = get().items.map((i) =>
        i.id === id ? { ...i, ...item } : i
      );
      set({ items });
    },

    removeItem: (id) => {
      const items = get().items.filter((i) => i.id !== id);
      set({ items });
    },

    getItems: () => get().items,

    getItemsTotal: () => {
      return get().items.reduce((sum, item) => {
        const total = item.quantity * item.unitPrice;
        return sum + total;
      }, 0);
    },

    addDocument: (file, documentType) => {
      const documents = [
        ...get().documents,
        {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          documentType,
          isUploading: false,
        },
      ];
      set({ documents });
    },

    updateDocument: (id, updates) => {
      const documents = get().documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      );
      set({ documents });
    },

    removeDocument: (id) => {
      const documents = get().documents.filter((d) => d.id !== id);
      set({ documents });
    },

    getDocuments: () => get().documents,

    reset: () => set(DEFAULT_STATE),
  })
);
