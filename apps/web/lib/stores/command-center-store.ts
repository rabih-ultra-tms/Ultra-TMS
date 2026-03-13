import { createStore } from './create-store';
import type { DrawerEntityType } from '@/lib/hooks/tms/use-command-center';

interface DrawerState {
  open: boolean;
  entityType: DrawerEntityType | null;
  entityId: string | null;
}

interface CommandCenterStoreState {
  // Drawer state (not in URL — ephemeral)
  drawer: DrawerState;
  kpiStripCollapsed: boolean;

  // Actions
  openDrawer: (entityType: DrawerEntityType, entityId: string) => void;
  closeDrawer: () => void;
  toggleKpiStrip: () => void;
}

export const useCommandCenterStore = createStore<CommandCenterStoreState>(
  'command-center-store',
  (set) => ({
    drawer: { open: false, entityType: null, entityId: null },
    kpiStripCollapsed: false,

    openDrawer: (entityType, entityId) =>
      set({ drawer: { open: true, entityType, entityId } }),
    closeDrawer: () =>
      set({ drawer: { open: false, entityType: null, entityId: null } }),
    toggleKpiStrip: () =>
      set(
        (state: Partial<CommandCenterStoreState>) =>
          ({
            kpiStripCollapsed: !state.kpiStripCollapsed,
          }) as Partial<CommandCenterStoreState>
      ),
  })
);
