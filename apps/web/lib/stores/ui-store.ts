import { createStore } from "./create-store";

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Command menu
  commandMenuOpen: boolean;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;

  // Command menu actions
  toggleCommandMenu: () => void;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUIStore = createStore<UIState>("ui-store", (set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  commandMenuOpen: false,
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  toggleCommandMenu: () => set({ commandMenuOpen: !get().commandMenuOpen }),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
}));
