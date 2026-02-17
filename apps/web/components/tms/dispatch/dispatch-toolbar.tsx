'use client';

/**
 * Dispatch Toolbar
 *
 * Top toolbar with view toggles, filters, search, and actions.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutGrid,
  GanttChart,
  Map,
  Search,
  Plus,
  ChevronDown,
  Calendar,
  Filter,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import type { DispatchFilters } from '@/lib/types/dispatch';
import type { ConnectionStatus } from '@/lib/socket/socket-config';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'timeline' | 'map';

interface DispatchToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: DispatchFilters;
  onFilterChange?: (filters: Partial<DispatchFilters>) => void;
  onSearch: (query: string) => void;
  connectionStatus?: {
    status: ConnectionStatus;
    connected: boolean;
    latency: number | null;
  };
}

export function DispatchToolbar({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange: _onFilterChange,
  onSearch,
  connectionStatus,
}: DispatchToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Trigger search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Quick filter presets
  const quickFilters = [
    { label: 'My Loads', key: 'my-loads' },
    { label: 'Urgent', key: 'urgent' },
    { label: 'Unassigned', key: 'unassigned', active: true },
    { label: 'At Risk', key: 'at-risk' },
  ];

  // Connection status indicator
  const renderConnectionStatus = () => {
    if (!connectionStatus) return null;

    const { status, connected, latency } = connectionStatus;

    if (connected) {
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-950 dark:text-green-400">
          <Wifi className="h-3 w-3" />
          <span className="font-medium">Live</span>
          {latency !== null && <span className="text-green-600 dark:text-green-500">({latency}ms)</span>}
        </div>
      );
    }

    if (status === 'reconnecting') {
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="font-medium">Reconnecting...</span>
        </div>
      );
    }

    // Disconnected or error
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950 dark:text-red-400">
        <WifiOff className="h-3 w-3" />
        <span className="font-medium">Offline</span>
      </div>
    );
  };

  return (
    <div className="border-b bg-background">
      {/* Main toolbar row */}
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Left: View toggles */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewModeChange('kanban')}
            >
              <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewModeChange('timeline')}
            >
              <GanttChart className="mr-1.5 h-3.5 w-3.5" />
              Timeline
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewModeChange('map')}
            >
              <Map className="mr-1.5 h-3.5 w-3.5" />
              Map
            </Button>
          </div>
        </div>

        {/* Center: Filters and Search */}
        <div className="flex flex-1 items-center gap-2 max-w-2xl">
          {/* Date Range */}
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            This Week
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          {/* Equipment Filter */}
          <Button variant="outline" size="sm" className="h-9">
            Equipment: All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          {/* Carrier Filter */}
          <Button variant="outline" size="sm" className="h-9">
            Carrier: All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search loads..."
              value={searchInput}
              onChange={handleSearchChange}
              className="h-9 pl-9"
            />
          </div>
        </div>

        {/* Right: Connection Status + Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          {renderConnectionStatus()}

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Bulk Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button size="sm" asChild>
            <Link href="/operations/loads/new">
              <Plus className="mr-2 h-4 w-4" />
              New Load
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick filter presets row */}
      <div className="flex items-center gap-2 px-6 pb-3">
        <span className="text-sm text-muted-foreground">Saved Filters:</span>
        {quickFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant={filter.active ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer',
              filter.active && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {filter.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
