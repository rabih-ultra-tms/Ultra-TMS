'use client';

/**
 * Command Center — Main Container
 *
 * Unified dispatch operations hub. Wraps existing DispatchBoard with
 * multi-domain tabs, layout modes, and KPI strip.
 *
 * MP-05-001: Container + route
 * MP-05-002: Multi-domain tab system
 */

import { Suspense, useCallback } from 'react';
import { useCommandCenter } from '@/lib/hooks/tms/use-command-center';
import { CommandCenterToolbar } from './command-center-toolbar';
import { CommandCenterKPIStrip } from './command-center-kpi-strip';
import { UniversalDetailDrawer } from './universal-detail-drawer';
import { LoadDrawerContent } from './load-drawer-content';
import { CarrierDrawerContent } from './carrier-drawer-content';
import { QuoteDrawerContent } from './quote-drawer-content';
import { SplitLayout } from './split-layout';
import { DashboardLayout } from './dashboard-layout';
import { FocusLayout } from './focus-layout';
import { DispatchBoard } from '@/components/tms/dispatch/dispatch-board';
import { DispatchBoardSkeleton } from '@/components/tms/dispatch/dispatch-board-skeleton';
import { AlertsPanel } from './alerts-panel';
import { useCommandCenterAlerts } from '@/lib/hooks/command-center/use-command-center';
import type { CCTab } from '@/lib/hooks/tms/use-command-center';
import type { DispatchLoad } from '@/lib/types/dispatch';
import { Package, FileText, Users, MapPin, AlertTriangle } from 'lucide-react';

/**
 * Placeholder panel for tabs that aren't built yet.
 * Will be replaced by real panels in CC-005 through CC-008.
 */
function PlaceholderPanel({ tab }: { tab: Exclude<CCTab, 'loads'> }) {
  const config: Record<
    Exclude<CCTab, 'loads'>,
    { icon: typeof Package; label: string; description: string }
  > = {
    quotes: {
      icon: FileText,
      label: 'Quotes Panel',
      description:
        'View and manage active quotes, approvals, and rate comparisons.',
    },
    carriers: {
      icon: Users,
      label: 'Carriers Panel',
      description:
        'Monitor carrier availability, scorecards, and insurance status.',
    },
    tracking: {
      icon: MapPin,
      label: 'Tracking Panel',
      description: 'Live map with truck positions and ETA predictions.',
    },
    alerts: {
      icon: AlertTriangle,
      label: 'Alerts Panel',
      description:
        'Prioritized alerts for stale loads, expired insurance, and exceptions.',
    },
  };

  const { icon: Icon, label, description } = config[tab];

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        <p className="text-xs text-muted-foreground/60">Coming in MP-05</p>
      </div>
    </div>
  );
}

export function CommandCenter() {
  const { activeTab, setActiveTab, layout, setLayout, drawer, openDrawer, closeDrawer } =
    useCommandCenter();
  const { data: alertsData } = useCommandCenterAlerts();
  const alertCount = alertsData?.data?.length ?? 0;

  // Dispatch board load click → open Command Center's universal drawer
  const handleLoadClick = useCallback(
    (load: DispatchLoad) => {
      openDrawer('load', String(load.id));
    },
    [openDrawer]
  );

  // Exit focus mode → return to board layout
  const exitFocus = useCallback(() => {
    setLayout('board');
  }, [setLayout]);

  /**
   * Renders the default tab content (board or placeholder)
   * Used by both Board and Split layouts as the "main" panel.
   */
  const tabContent = (
    <>
      {activeTab === 'loads' ? (
        <Suspense fallback={<DispatchBoardSkeleton />}>
          <DispatchBoard onLoadClick={handleLoadClick} />
        </Suspense>
      ) : activeTab === 'alerts' ? (
        <AlertsPanel />
      ) : (
        <PlaceholderPanel tab={activeTab} />
      )}
    </>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar: domain tabs + layout toggle + actions */}
      <CommandCenterToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        layout={layout}
        onLayoutChange={setLayout}
        alertCount={alertCount}
      />

      {/* KPI Strip — hidden in dashboard (it has its own KPI cards) and focus modes */}
      {layout !== 'dashboard' && layout !== 'focus' && (
        <CommandCenterKPIStrip activeTab={activeTab} />
      )}

      {/* Layout-dependent content */}
      <div className="flex-1 overflow-hidden">
        {layout === 'board' && tabContent}

        {layout === 'split' && (
          <SplitLayout activeTab={activeTab} mainContent={tabContent} />
        )}

        {layout === 'dashboard' && <DashboardLayout />}

        {layout === 'focus' && (
          <FocusLayout
            entityType={drawer.entityType}
            entityId={drawer.entityId}
            onExit={exitFocus}
          />
        )}
      </div>

      {/* Universal Detail Drawer — not shown in focus mode (entity is full-width) */}
      {layout !== 'focus' && (
        <UniversalDetailDrawer
          open={drawer.open}
          onClose={closeDrawer}
          entityType={drawer.entityType}
          entityId={drawer.entityId}
        >
          {drawer.entityType === 'load' && drawer.entityId && (
            <LoadDrawerContent loadId={drawer.entityId} />
          )}
          {drawer.entityType === 'carrier' && drawer.entityId && (
            <CarrierDrawerContent carrierId={drawer.entityId} />
          )}
          {drawer.entityType === 'quote' && drawer.entityId && (
            <QuoteDrawerContent quoteId={drawer.entityId} />
          )}
        </UniversalDetailDrawer>
      )}
    </div>
  );
}
