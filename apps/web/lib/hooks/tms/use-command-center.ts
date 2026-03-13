'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Command Center domain tabs
 */
export const CC_TABS = [
  'loads',
  'quotes',
  'carriers',
  'tracking',
  'alerts',
] as const;
export type CCTab = (typeof CC_TABS)[number];

/**
 * Command Center layout modes
 */
export const CC_LAYOUTS = ['board', 'split', 'dashboard', 'focus'] as const;
export type CCLayout = (typeof CC_LAYOUTS)[number];

/**
 * Drawer entity types
 */
export type DrawerEntityType = 'load' | 'quote' | 'carrier' | 'order' | 'alert';

export interface DrawerState {
  open: boolean;
  entityType: DrawerEntityType | null;
  entityId: string | null;
}

function isValidTab(value: string | null): value is CCTab {
  return value !== null && CC_TABS.includes(value as CCTab);
}

function isValidLayout(value: string | null): value is CCLayout {
  return value !== null && CC_LAYOUTS.includes(value as CCLayout);
}

/**
 * State management hook for Command Center.
 * Persists active tab and layout mode in URL query params.
 */
export function useCommandCenter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read from URL params with defaults
  const activeTab: CCTab = useMemo(() => {
    const param = searchParams.get('tab');
    return isValidTab(param) ? param : 'loads';
  }, [searchParams]);

  const layout: CCLayout = useMemo(() => {
    const param = searchParams.get('layout');
    return isValidLayout(param) ? param : 'board';
  }, [searchParams]);

  // URL updater — preserves other params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setActiveTab = useCallback(
    (tab: CCTab) => {
      updateParams({ tab });
    },
    [updateParams]
  );

  const setLayout = useCallback(
    (newLayout: CCLayout) => {
      updateParams({ layout: newLayout });
    },
    [updateParams]
  );

  return {
    activeTab,
    setActiveTab,
    layout,
    setLayout,
  };
}
