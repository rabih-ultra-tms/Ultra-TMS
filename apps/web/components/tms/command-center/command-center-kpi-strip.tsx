'use client';

/**
 * Command Center KPI Strip
 *
 * Horizontal strip of key performance indicators shown below the toolbar.
 * Displays real-time counts for the active domain.
 */

import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CCTab } from '@/lib/hooks/tms/use-command-center';

interface KPIItem {
  label: string;
  value: string | number;
  icon: typeof Package;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const LOADS_KPIS: KPIItem[] = [
  { label: 'Today', value: '—', icon: Package, color: 'text-blue-600' },
  { label: 'Pending', value: '—', icon: Clock, color: 'text-amber-600' },
  { label: 'In Transit', value: '—', icon: Truck, color: 'text-cyan-600' },
  {
    label: 'Delivered',
    value: '—',
    icon: CheckCircle,
    color: 'text-emerald-600',
  },
  { label: 'At Risk', value: '—', icon: AlertTriangle, color: 'text-red-600' },
];

const QUOTES_KPIS: KPIItem[] = [
  { label: 'Active', value: '—', icon: Package, color: 'text-blue-600' },
  {
    label: 'Pending Approval',
    value: '—',
    icon: Clock,
    color: 'text-amber-600',
  },
  {
    label: 'Expiring Today',
    value: '—',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
];

const CARRIERS_KPIS: KPIItem[] = [
  { label: 'Available', value: '—', icon: Truck, color: 'text-emerald-600' },
  { label: 'On Load', value: '—', icon: Package, color: 'text-blue-600' },
  {
    label: 'Suspended',
    value: '—',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
];

const REVENUE_KPIS: KPIItem[] = [
  {
    label: 'Today Revenue',
    value: '—',
    icon: DollarSign,
    color: 'text-emerald-600',
  },
  {
    label: 'MTD Revenue',
    value: '—',
    icon: TrendingUp,
    color: 'text-blue-600',
  },
  { label: 'Margin', value: '—', icon: TrendingUp, color: 'text-indigo-600' },
];

function getKPIsForTab(tab: CCTab): KPIItem[] {
  switch (tab) {
    case 'loads':
      return LOADS_KPIS;
    case 'quotes':
      return QUOTES_KPIS;
    case 'carriers':
      return CARRIERS_KPIS;
    case 'tracking':
      return REVENUE_KPIS;
    case 'alerts':
      return [];
    default:
      return LOADS_KPIS;
  }
}

interface CommandCenterKPIStripProps {
  activeTab: CCTab;
}

export function CommandCenterKPIStrip({
  activeTab,
}: CommandCenterKPIStripProps) {
  const kpis = getKPIsForTab(activeTab);

  if (kpis.length === 0) return null;

  return (
    <div className="flex items-center gap-6 border-b border-border bg-muted/30 px-4 py-2">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', color ?? 'text-muted-foreground')} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
