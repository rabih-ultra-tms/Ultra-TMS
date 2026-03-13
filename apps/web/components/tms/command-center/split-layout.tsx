'use client';

/**
 * Split Layout — Command Center Layout Mode
 *
 * Board (60%) + Side Panel (40%) side by side.
 * The side panel shows context relevant to the active tab:
 * - Loads: Activity feed or selected load details
 * - Carriers: Carrier availability list
 * - Quotes: Quote pipeline summary
 * - Tracking/Alerts: respective panels
 *
 * MP-05-008
 */

import { Suspense } from 'react';
import {
  Activity,
  Users,
  FileText,
  MapPin,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { DispatchBoard } from '@/components/tms/dispatch/dispatch-board';
import { DispatchBoardSkeleton } from '@/components/tms/dispatch/dispatch-board-skeleton';
import { AlertsPanel } from './alerts-panel';
import type { CCTab } from '@/lib/hooks/tms/use-command-center';

interface SplitLayoutProps {
  activeTab: CCTab;
  mainContent: React.ReactNode;
}

function PanelPlaceholder({
  icon: Icon,
  label,
  description,
}: {
  icon: typeof Activity;
  label: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-2 px-4">
        <Icon className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>
    </div>
  );
}

function SidePanel({ activeTab }: { activeTab: CCTab }) {
  switch (activeTab) {
    case 'loads':
      return (
        <PanelPlaceholder
          icon={Activity}
          label="Activity Feed"
          description="Recent load updates and status changes"
        />
      );
    case 'quotes':
      return (
        <PanelPlaceholder
          icon={FileText}
          label="Quote Pipeline"
          description="Active quotes by stage"
        />
      );
    case 'carriers':
      return (
        <PanelPlaceholder
          icon={Users}
          label="Carrier Availability"
          description="Available carriers with capacity"
        />
      );
    case 'tracking':
      return (
        <PanelPlaceholder
          icon={MapPin}
          label="Map View"
          description="Live truck positions (requires Google Maps)"
        />
      );
    case 'alerts':
      return <AlertsPanel />;
    default:
      return null;
  }
}

export function SplitLayout({ activeTab, mainContent }: SplitLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Main panel — 60% */}
      <div className="flex-[3] min-w-0 overflow-hidden border-r border-border">
        {mainContent}
      </div>

      {/* Side panel — 40% */}
      <div className="flex-[2] min-w-0 overflow-hidden bg-muted/20">
        <SidePanel activeTab={activeTab} />
      </div>
    </div>
  );
}
