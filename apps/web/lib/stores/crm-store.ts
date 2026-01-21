import { createStore } from "./create-store";
import type { CustomerStatus, LeadStage } from "@/lib/types/crm";

interface CustomerFilters {
  search: string;
  status: CustomerStatus | "";
  accountManagerId: string;
}

interface LeadFilters {
  search: string;
  stage: LeadStage | "";
  ownerId: string;
}

interface CRMState {
  customerFilters: CustomerFilters;
  setCustomerFilter: <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => void;
  resetCustomerFilters: () => void;
  leadFilters: LeadFilters;
  setLeadFilter: <K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K]
  ) => void;
  resetLeadFilters: () => void;
  leadsViewMode: "table" | "pipeline";
  setLeadsViewMode: (mode: "table" | "pipeline") => void;
  selectedCustomerId: string | null;
  setSelectedCustomer: (id: string | null) => void;
}

const defaultCustomerFilters: CustomerFilters = {
  search: "",
  status: "",
  accountManagerId: "",
};

const defaultLeadFilters: LeadFilters = {
  search: "",
  stage: "",
  ownerId: "",
};

export const useCRMStore = createStore<CRMState>("crm-store", (set, get) => ({
  customerFilters: defaultCustomerFilters,
  setCustomerFilter: (key, value) =>
    set({ customerFilters: { ...get().customerFilters, [key]: value } }),
  resetCustomerFilters: () => set({ customerFilters: defaultCustomerFilters }),
  leadFilters: defaultLeadFilters,
  setLeadFilter: (key, value) =>
    set({ leadFilters: { ...get().leadFilters, [key]: value } }),
  resetLeadFilters: () => set({ leadFilters: defaultLeadFilters }),
  leadsViewMode: "table",
  setLeadsViewMode: (mode) => set({ leadsViewMode: mode }),
  selectedCustomerId: null,
  setSelectedCustomer: (id) => set({ selectedCustomerId: id }),
}));
