import { createStore } from "./create-store";

interface UIState {
  sidebarOpen: boolean;
  commandMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandMenu: () => void;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUIStore = createStore<UIState>("ui-store", (set, get) => ({
  sidebarOpen: true,
  commandMenuOpen: false,
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandMenu: () => set({ commandMenuOpen: !get().commandMenuOpen }),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
}));
