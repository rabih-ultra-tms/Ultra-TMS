'use client';

/**
 * Dispatch Toolbar (Power-User Style)
 *
 * Compact single-line toolbar with:
 * + New Load button, status/customer/carrier/equipment filter dropdowns,
 *   date filter, reset button, group toggle, search.
 *
 * Design reference: superdesign/design_iterations/dispatch_r4_playground.html
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ChevronDown,
  Calendar,
  Layers,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  FileText,
  LayoutGrid,
  Table,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type {
  DispatchFilters,
  LoadStatus,
  EquipmentType,
} from '@/lib/types/dispatch';
import type { ConnectionStatus } from '@/lib/socket/socket-config';

// ── Status options ─────────────────────────────────────────────────
const STATUS_OPTIONS: { value: LoadStatus; label: string; color: string }[] = [
  { value: 'IN_TRANSIT', label: 'In Transit', color: 'bg-blue-500' },
  { value: 'PENDING', label: 'Unassigned', color: 'bg-amber-500' },
  { value: 'TENDERED', label: 'Tendered', color: 'bg-violet-500' },
  { value: 'DISPATCHED', label: 'Dispatched', color: 'bg-cyan-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-500' },
];

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string }[] = [
  { value: 'DRY_VAN', label: 'Dry Van' },
  { value: 'REEFER', label: 'Reefer' },
  { value: 'FLATBED', label: 'Flatbed' },
  { value: 'STEP_DECK', label: 'Step Deck' },
  { value: 'OTHER', label: 'Other' },
];

// ── Props ──────────────────────────────────────────────────────────
interface DispatchToolbarProps {
  filters: DispatchFilters;
  onFilterChange: (filters: Partial<DispatchFilters>) => void;
  onSearch: (query: string) => void;
  grouped: boolean;
  onGroupToggle: () => void;
  viewMode?: 'kanban' | 'table';
  onViewModeChange?: (mode: 'kanban' | 'table') => void;
  onRefresh: () => void;
  onNewLoad: () => void;
  onNewQuote: () => void;
  connectionStatus?: {
    status: ConnectionStatus;
    connected: boolean;
    latency: number | null;
  };
}

export function DispatchToolbar({
  filters,
  onFilterChange,
  onSearch,
  grouped,
  onGroupToggle,
  viewMode = 'table',
  onViewModeChange,
  onRefresh,
  onNewLoad,
  onNewQuote,
  connectionStatus,
}: DispatchToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => onSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, onSearch]);

  // ── Active status filter text ──────────────────────────────────
  const statusText = (() => {
    if (!filters.statuses?.length) return 'All Statuses';
    if (filters.statuses.length === 1) {
      const opt = STATUS_OPTIONS.find((o) => o.value === filters.statuses![0]);
      return opt?.label ?? 'All Statuses';
    }
    return `${filters.statuses.length} Selected`;
  })();

  const equipText = (() => {
    if (!filters.equipmentTypes?.length) return 'All Equipment';
    if (filters.equipmentTypes.length === 1) {
      const opt = EQUIPMENT_OPTIONS.find(
        (o) => o.value === filters.equipmentTypes![0]
      );
      return opt?.label ?? 'All Equipment';
    }
    return `${filters.equipmentTypes.length} Selected`;
  })();

  const hasActiveFilters = !!(
    filters.statuses?.length ||
    filters.equipmentTypes?.length ||
    filters.search
  );

  const resetAll = useCallback(() => {
    onFilterChange({
      statuses: undefined,
      equipmentTypes: undefined,
      search: undefined,
    });
    setSearchInput('');
  }, [onFilterChange]);

  // Connection indicator
  const connectionIndicator = connectionStatus?.connected ? (
    <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
      <Wifi className="h-3 w-3" />
      <span className="font-medium">Live</span>
    </div>
  ) : connectionStatus?.status === 'reconnecting' ? (
    <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="font-medium">Reconnecting</span>
    </div>
  ) : connectionStatus ? (
    <div className="flex items-center gap-1 text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
      <WifiOff className="h-3 w-3" />
      <span className="font-medium">Offline</span>
    </div>
  ) : null;

  return (
    <>
      {/* Header row */}
      <div className="h-12 bg-[#F8F9FB] border-b flex items-center px-5 gap-4 shrink-0">
        <h1 className="text-[15px] font-semibold whitespace-nowrap">
          Dispatch Board
        </h1>

        {/* Search */}
        <div className="flex-1 max-w-[400px] mx-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search loads..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-8 pl-8 pr-10 rounded-lg border border-gray-200 bg-white text-[13px] text-foreground outline-none focus:border-slate-700 transition-colors"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground px-1 py-px border border-gray-200 rounded pointer-events-none">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-1">
          {connectionIndicator}
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toolbar row */}
      <div className="h-10 bg-white border-b flex items-center px-5 gap-1.5 shrink-0 overflow-x-auto">
        {/* New Load */}
        <button
          onClick={onNewLoad}
          className="h-[26px] px-3 rounded-md bg-slate-700 text-white text-xs font-medium flex items-center gap-1 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="h-3 w-3" />
          New Load
        </button>

        <button
          onClick={onNewQuote}
          className="h-[26px] px-3 rounded-md border border-slate-700 text-slate-700 bg-white text-xs font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors shrink-0"
        >
          <FileText className="h-3 w-3" />
          New Quote
        </button>

        <div className="w-px h-[18px] bg-gray-200 mx-1.5" />

        {/* Status filter */}
        <FilterDropdown
          label={statusText}
          isActive={!!filters.statuses?.length}
        >
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-gray-50 text-xs cursor-pointer"
            >
              <Checkbox
                checked={
                  !filters.statuses?.length ||
                  filters.statuses.includes(opt.value)
                }
                onCheckedChange={(checked) => {
                  const current = filters.statuses ?? [];
                  const next = checked
                    ? [...current, opt.value]
                    : current.filter((s) => s !== opt.value);
                  onFilterChange({
                    statuses: next.length > 0 ? next : undefined,
                  });
                }}
                className="h-3.5 w-3.5"
              />
              <span className={cn('h-[7px] w-[7px] rounded-full', opt.color)} />
              {opt.label}
            </label>
          ))}
        </FilterDropdown>

        {/* Equipment filter */}
        <FilterDropdown
          label={equipText}
          isActive={!!filters.equipmentTypes?.length}
        >
          {EQUIPMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-gray-50 text-xs cursor-pointer"
            >
              <Checkbox
                checked={
                  !filters.equipmentTypes?.length ||
                  filters.equipmentTypes.includes(opt.value)
                }
                onCheckedChange={(checked) => {
                  const current = filters.equipmentTypes ?? [];
                  const next = checked
                    ? [...current, opt.value]
                    : current.filter((e) => e !== opt.value);
                  onFilterChange({
                    equipmentTypes: next.length > 0 ? next : undefined,
                  });
                }}
                className="h-3.5 w-3.5"
              />
              {opt.label}
            </label>
          ))}
        </FilterDropdown>

        {/* Date filter (placeholder) */}
        <button className="h-[30px] px-2.5 border border-gray-200 rounded-md bg-white text-muted-foreground text-xs flex items-center gap-1.5 whitespace-nowrap hover:border-gray-400 transition-colors">
          <Calendar className="h-3 w-3" />
          Pickup: Any date
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="h-[30px] px-2.5 text-slate-700 text-xs font-medium hover:underline whitespace-nowrap"
          >
            Reset
          </button>
        )}

        <div className="flex-1" />

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'h-[26px] px-2 text-[11px] font-medium flex items-center gap-1 transition-colors',
                viewMode === 'table'
                  ? 'bg-slate-100 text-slate-700'
                  : 'text-muted-foreground hover:text-slate-700'
              )}
              title="Table view"
            >
              <Table className="h-3 w-3" />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={cn(
                'h-[26px] px-2 text-[11px] font-medium flex items-center gap-1 transition-colors',
                viewMode === 'kanban'
                  ? 'bg-slate-100 text-slate-700'
                  : 'text-muted-foreground hover:text-slate-700'
              )}
              title="Kanban view"
            >
              <LayoutGrid className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Group toggle (table view only) */}
        {viewMode === 'table' && (
          <button
            onClick={onGroupToggle}
            className={cn(
              'h-[26px] px-2 border rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors',
              grouped
                ? 'bg-slate-100 border-slate-700 text-slate-700'
                : 'border-gray-200 text-muted-foreground hover:border-slate-700 hover:text-slate-700'
            )}
          >
            <Layers className="h-3 w-3" />
            Group
          </button>
        )}
      </div>
    </>
  );
}

// ── Filter Dropdown Component ─────────────────────────────────────
function FilterDropdown({
  label,
  isActive,
  children,
}: {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<React.ElementRef<'div'>>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          'h-[30px] px-2.5 border rounded-md bg-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors',
          isActive
            ? 'border-slate-700 text-slate-700 bg-slate-50'
            : 'border-gray-200 text-foreground hover:border-slate-700'
        )}
      >
        {label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 min-w-[200px] max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-[100]"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
