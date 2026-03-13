'use client';

/**
 * Command Center Toolbar
 *
 * Domain tabs (Loads, Quotes, Carriers, Tracking, Alerts) + layout mode toggle + actions.
 * Extends the existing DispatchToolbar pattern with multi-domain awareness.
 */

import {
  Package,
  FileText,
  Users,
  MapPin,
  AlertTriangle,
  LayoutGrid,
  Columns,
  BarChart3,
  Maximize,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CCTab, CCLayout } from '@/lib/hooks/tms/use-command-center';

const TAB_CONFIG: {
  id: CCTab;
  label: string;
  icon: typeof Package;
}[] = [
  { id: 'loads', label: 'Loads', icon: Package },
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'carriers', label: 'Carriers', icon: Users },
  { id: 'tracking', label: 'Tracking', icon: MapPin },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

const LAYOUT_CONFIG: {
  id: CCLayout;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'split', label: 'Split', icon: Columns },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'focus', label: 'Focus', icon: Maximize },
];

interface CommandCenterToolbarProps {
  activeTab: CCTab;
  onTabChange: (tab: CCTab) => void;
  layout: CCLayout;
  onLayoutChange: (layout: CCLayout) => void;
  alertCount?: number;
  onNewAction?: () => void;
  onRefresh?: () => void;
}

export function CommandCenterToolbar({
  activeTab,
  onTabChange,
  layout,
  onLayoutChange,
  alertCount,
  onNewAction,
  onRefresh,
}: CommandCenterToolbarProps) {
  return (
    <div className="flex flex-col border-b border-border bg-card">
      {/* Top row: Domain tabs */}
      <div className="flex items-center gap-1 px-4 pt-2">
        <nav
          className="flex items-center gap-1"
          role="tablist"
          aria-label="Command Center domains"
        >
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => onTabChange(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors',
                activeTab === id
                  ? 'border-b-2 border-primary bg-background text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {id === 'alerts' &&
                alertCount !== undefined &&
                alertCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 min-w-5 px-1 text-xs"
                  >
                    {alertCount > 99 ? '99+' : alertCount}
                  </Badge>
                )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Layout mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            {LAYOUT_CONFIG.map(({ id, label, icon: Icon }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onLayoutChange(id)}
                    className={cn(
                      'rounded-md p-1.5 transition-colors',
                      layout === id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={`${label} layout`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {onNewAction && (
            <Button size="sm" onClick={onNewAction} className="h-8 gap-1">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row: Search bar (contextual to active tab) */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
