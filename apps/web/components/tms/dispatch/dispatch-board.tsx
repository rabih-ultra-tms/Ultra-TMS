'use client';

/**
 * Dispatch Board Container (Power-User Table Layout)
 *
 * Orchestrates the dispatch board with a compact data table view,
 * filter toolbar, stats bar, and detail drawer.
 *
 * Design reference: superdesign/design_iterations/dispatch_r4_playground.html
 */

import { useState, useCallback } from 'react';
import { DispatchToolbar } from './dispatch-toolbar';
import { DispatchStatsBar } from './dispatch-stats-bar';
import { DispatchDataTable } from './dispatch-data-table';
import { KanbanBoard } from './kanban-board';
import { DispatchDetailDrawer } from './dispatch-detail-drawer';
import { NewLoadDialog } from './new-load-dialog';
import { NewQuoteDialog } from './new-quote-dialog';
import { useDispatchLoads } from '@/lib/hooks/tms/use-dispatch';
import { useDispatchBoardUpdates } from '@/lib/hooks/tms/use-dispatch-ws';
import { useSocketStatus } from '@/lib/socket/use-socket-status';
import type {
  DispatchFilters,
  SortConfig,
  DispatchLoad,
} from '@/lib/types/dispatch';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DispatchBoardProps {
  /** When provided, load clicks call this instead of the internal detail drawer */
  onLoadClick?: (load: DispatchLoad) => void;
  /** Controlled selection — when provided, parent owns the selection state */
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
}

export function DispatchBoard({
  onLoadClick: externalLoadClick,
  selectedIds: controlledSelectedIds,
  onSelectionChange: controlledOnSelectionChange,
}: DispatchBoardProps = {}) {
  // Filter state
  const [filters, setFilters] = useState<DispatchFilters>({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'pickupDate',
    direction: 'asc',
  });

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [grouped, setGrouped] = useState(true);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<number>>(new Set());
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = controlledOnSelectionChange ?? setInternalSelectedIds;
  const [drawerLoad, setDrawerLoad] = useState<DispatchLoad | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newLoadOpen, setNewLoadOpen] = useState(false);
  const [newQuoteOpen, setNewQuoteOpen] = useState(false);

  // WebSocket connection
  const { connected, status, latency } = useSocketStatus();

  // Real-time updates
  useDispatchBoardUpdates({
    enabled: true,
    showToasts: true,
    playSound: false,
  });

  // Fetch data (poll fallback when WS down)
  const {
    data: boardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDispatchLoads(filters, sortConfig, {
    refetchInterval: connected ? undefined : 30000,
  });

  // Handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<DispatchFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query || undefined }));
  }, []);

  const handleLoadClick = useCallback((load: DispatchLoad) => {
    if (externalLoadClick) {
      externalLoadClick(load);
      return;
    }
    setDrawerLoad(load);
    setDrawerOpen(true);
  }, [externalLoadClick]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleGroupToggle = useCallback(() => {
    setGrouped((prev) => !prev);
  }, []);

  // Shared toolbar props
  const toolbarProps = {
    filters,
    onFilterChange: handleFilterChange,
    onSearch: handleSearch,
    grouped,
    onGroupToggle: handleGroupToggle,
    viewMode,
    onViewModeChange: setViewMode,
    onRefresh: () => refetch(),
    onNewLoad: () => setNewLoadOpen(true),
    onNewQuote: () => setNewQuoteOpen(true),
    connectionStatus: { status, connected, latency },
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading && !boardData) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <DispatchToolbar {...toolbarProps} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-700 border-r-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading dispatch board...
            </p>
          </div>
        </div>
        <NewLoadDialog open={newLoadOpen} onOpenChange={setNewLoadOpen} />
        <NewQuoteDialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen} />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <DispatchToolbar {...toolbarProps} />
        <div className="flex-1 p-6">
          <Alert variant="destructive" className="mx-auto max-w-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold">
                  Unable to load the dispatch board
                </p>
                <p className="text-sm">
                  {error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred'}
                </p>
                <Button onClick={() => refetch()} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <NewLoadDialog open={newLoadOpen} onOpenChange={setNewLoadOpen} />
        <NewQuoteDialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen} />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────
  if (!boardData || boardData.loads.length === 0) {
    const isFiltered =
      filters.search ||
      filters.equipmentTypes?.length ||
      filters.statuses?.length;

    return (
      <div className="flex h-full flex-col overflow-hidden">
        <DispatchToolbar {...toolbarProps} />
        <div className="flex-1 flex items-center justify-center">
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
                <h3 className="text-lg font-semibold">
                  No loads match your filters
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Try adjusting your date range, status, or search terms to see
                  loads.
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
                <h3 className="text-lg font-semibold">
                  Your dispatch board is empty
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Create your first load or import orders to start dispatching.
                </p>
                <Button onClick={() => setNewLoadOpen(true)}>
                  Create First Load
                </Button>
              </>
            )}
          </div>
        </div>
        <NewLoadDialog open={newLoadOpen} onOpenChange={setNewLoadOpen} />
        <NewQuoteDialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen} />
      </div>
    );
  }

  // ── Main board ─────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header + Toolbar */}
      <DispatchToolbar {...toolbarProps} />

      {/* Stats Bar */}
      <DispatchStatsBar stats={boardData.stats} loads={boardData.loads} />

      {/* Board Content — Kanban or Table */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          boardData={boardData}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
        />
      ) : (
        <DispatchDataTable
          loads={boardData.loads}
          grouped={grouped}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onLoadClick={handleLoadClick}
        />
      )}

      {/* Detail Drawer */}
      <DispatchDetailDrawer
        load={drawerLoad}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onStatusChange={() => refetch()}
      />

      {/* New Load Dialog */}
      <NewLoadDialog open={newLoadOpen} onOpenChange={setNewLoadOpen} />

      {/* New Quote Dialog */}
      <NewQuoteDialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen} />
    </div>
  );
}
