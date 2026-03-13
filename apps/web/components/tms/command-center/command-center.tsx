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

import { Suspense } from 'react';
import { useCommandCenter } from '@/lib/hooks/tms/use-command-center';
import { CommandCenterToolbar } from './command-center-toolbar';
import { CommandCenterKPIStrip } from './command-center-kpi-strip';
import { UniversalDetailDrawer } from './universal-detail-drawer';
import { LoadDrawerContent } from './load-drawer-content';
import { DispatchBoard } from '@/components/tms/dispatch/dispatch-board';
import { DispatchBoardSkeleton } from '@/components/tms/dispatch/dispatch-board-skeleton';
import type { CCTab } from '@/lib/hooks/tms/use-command-center';
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
  const { activeTab, setActiveTab, layout, setLayout, drawer, closeDrawer } =
    useCommandCenter();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar: domain tabs + layout toggle + actions */}
      <CommandCenterToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {/* KPI Strip */}
      <CommandCenterKPIStrip activeTab={activeTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'loads' ? (
          <Suspense fallback={<DispatchBoardSkeleton />}>
            <DispatchBoard />
          </Suspense>
        ) : (
          <PlaceholderPanel tab={activeTab} />
        )}
      </div>

      {/* Universal Detail Drawer — renders entity-specific content */}
      <UniversalDetailDrawer
        open={drawer.open}
        onClose={closeDrawer}
        entityType={drawer.entityType}
        entityId={drawer.entityId}
      >
        {drawer.entityType === 'load' && drawer.entityId && (
          <LoadDrawerContent loadId={drawer.entityId} />
        )}
      </UniversalDetailDrawer>
    </div>
  );
}
