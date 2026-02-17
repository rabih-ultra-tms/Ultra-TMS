'use client';

/**
 * Dispatch Board Container
 *
 * Main container component orchestrating the dispatch board.
 * Manages filters, view state, and coordinates all sub-components.
 */

import { useState, useCallback } from 'react';
import { DispatchToolbar } from './dispatch-toolbar';
import { DispatchKpiStrip } from './dispatch-kpi-strip';
import { KanbanBoard } from './kanban-board';
import { useDispatchLoads } from '@/lib/hooks/tms/use-dispatch';
import { useDispatchBoardUpdates } from '@/lib/hooks/tms/use-dispatch-ws';
import { useSocketStatus } from '@/lib/socket/use-socket-status';
import type { DispatchFilters, SortConfig } from '@/lib/types/dispatch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ViewMode = 'kanban' | 'timeline' | 'map';

export function DispatchBoard() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Filter state
  const [filters, setFilters] = useState<DispatchFilters>({
    dateFrom: new Date().toISOString().split('T')[0], // Today
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'pickupDate',
    direction: 'asc',
  });

  // WebSocket connection status
  const { connected, status, latency } = useSocketStatus();

  // Real-time WebSocket updates
  const { animationCount: _animationCount } = useDispatchBoardUpdates({
    enabled: true,
    showToasts: true,
    playSound: false, // Optional: enable if user wants audio notifications
  });

  // Fetch dispatch board data
  // Only poll when WebSocket is disconnected (graceful degradation)
  const { data: boardData, isLoading, isError, error, refetch } = useDispatchLoads(
    filters,
    sortConfig,
    { refetchInterval: connected ? undefined : 30000 } // 30s polling fallback when WS disconnected
  );

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<DispatchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort: SortConfig) => {
    setSortConfig(newSort);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query || undefined }));
  }, []);

  // Loading state
  if (isLoading && !boardData) {
    return (
      <div className="flex h-full flex-col">
        <DispatchToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          connectionStatus={{ status, connected, latency }}
        />
        <div className="flex-1 p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading dispatch board...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-full flex-col">
        <DispatchToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          connectionStatus={{ status, connected, latency }}
        />
        <div className="flex-1 p-6">
          <Alert variant="destructive" className="mx-auto max-w-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold">Unable to load the dispatch board</p>
                <p className="text-sm">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
                <Button onClick={() => refetch()} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty state (no loads)
  if (!boardData || boardData.loads.length === 0) {
    const isFiltered = filters.search || filters.equipmentTypes?.length || filters.carrierId;

    return (
      <div className="flex h-full flex-col">
        <DispatchToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          connectionStatus={{ status, connected, latency }}
        />
        <div className="flex-1 p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-muted-foreground/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              {isFiltered ? (
                <>
                  <h3 className="text-lg font-semibold">No loads match your filters</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try adjusting your date range, status, or search terms to see loads.
                  </p>
                  <Button
                    onClick={() =>
                      setFilters({
                        dateFrom: new Date().toISOString().split('T')[0],
                        dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split('T')[0],
                      })
                    }
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Your dispatch board is empty</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Create your first load or import orders to start dispatching. Loads will appear
                    here organized by status.
                  </p>
                  <Button asChild>
                    <Link href="/operations/loads/new">Create First Load</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render board based on view mode
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <DispatchToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        connectionStatus={{ status, connected, latency }}
      />

      {/* KPI Strip */}
      <DispatchKpiStrip stats={boardData.stats} />

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' && (
          <KanbanBoard
            boardData={boardData}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        )}
        {viewMode === 'timeline' && (
          <div className="flex h-full items-center justify-center p-12">
            <p className="text-muted-foreground">Timeline view — coming soon</p>
          </div>
        )}
        {viewMode === 'map' && (
          <div className="flex h-full items-center justify-center p-12">
            <p className="text-muted-foreground">Map view — coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
