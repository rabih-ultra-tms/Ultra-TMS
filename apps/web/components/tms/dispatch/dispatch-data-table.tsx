'use client';

/**
 * Dispatch Data Table
 *
 * Power-user style compact data table for the dispatch board.
 * Features: grouped rows by status, collapsible groups, checkbox selection,
 * keyboard navigation (j/k/Enter), status-based row wash tinting,
 * glow hover, at-risk indicators, and click-to-open detail drawer.
 *
 * Design reference: superdesign/design_iterations/dispatch_r4_playground.html
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { DispatchLoad, KanbanLane } from '@/lib/types/dispatch';
import { STATUS_TO_LANE, LANE_CONFIG } from '@/lib/types/dispatch';

// ── Status display config ─────────────────────────────────────────────
const STATUS_DISPLAY: Record<
  KanbanLane,
  { label: string; dotColor: string; washClass: string }
> = {
  UNASSIGNED: {
    label: 'Unassigned',
    dotColor: 'bg-amber-500',
    washClass: 'bg-amber-500/[.08]',
  },
  TENDERED: {
    label: 'Tendered',
    dotColor: 'bg-violet-500',
    washClass: 'bg-violet-500/[.08]',
  },
  DISPATCHED: {
    label: 'Dispatched',
    dotColor: 'bg-cyan-500',
    washClass: 'bg-cyan-500/[.08]',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    dotColor: 'bg-blue-500',
    washClass: 'bg-blue-500/[.08]',
  },
  DELIVERED: {
    label: 'Delivered',
    dotColor: 'bg-emerald-500',
    washClass: 'bg-emerald-500/[.08]',
  },
  COMPLETED: {
    label: 'Completed',
    dotColor: 'bg-emerald-600',
    washClass: 'bg-emerald-600/[.08]',
  },
};

// ── Lane sort order ───────────────────────────────────────────────────
const LANE_ORDER: KanbanLane[] = [
  'IN_TRANSIT',
  'UNASSIGNED',
  'TENDERED',
  'DISPATCHED',
  'DELIVERED',
  'COMPLETED',
];

// ── Badge component ───────────────────────────────────────────────────
function StatusBadge({ lane, atRisk }: { lane: KanbanLane; atRisk: boolean }) {
  if (atRisk) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <span className="h-[7px] w-[7px] rounded-full bg-red-500" />
        At Risk
      </span>
    );
  }
  const cfg = STATUS_DISPLAY[lane];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
      <span className={cn('h-[7px] w-[7px] rounded-full', cfg.dotColor)} />
      {cfg.label}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────
function getOrigin(load: DispatchLoad) {
  const stop = load.stops.find((s) => s.type === 'PICKUP');
  return stop ? `${stop.city}, ${stop.state}` : '—';
}

function getDestination(load: DispatchLoad) {
  const stop = load.stops.find((s) => s.type === 'DELIVERY');
  return stop ? `${stop.city}, ${stop.state}` : '—';
}

function getPickupDate(load: DispatchLoad) {
  const stop = load.stops.find((s) => s.type === 'PICKUP');
  if (!stop) return '—';
  return new Date(stop.appointmentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

function getDeliveryDate(load: DispatchLoad) {
  const stop = load.stops.find((s) => s.type === 'DELIVERY');
  if (!stop) return '—';
  return new Date(stop.appointmentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

function formatEquipment(eq: string) {
  const map: Record<string, string> = {
    DRY_VAN: 'Dry Van',
    REEFER: 'Reefer',
    FLATBED: 'Flatbed',
    STEP_DECK: 'Step Deck',
    OTHER: 'Other',
  };
  return map[eq] ?? eq;
}

function formatRate(rate?: number) {
  if (!rate) return '—';
  return '$' + rate.toLocaleString();
}

function formatWeight(weight?: number) {
  if (!weight) return '—';
  return weight.toLocaleString() + ' lbs';
}

function getIsAtRisk(load: DispatchLoad) {
  return load.hasExceptions || load.priority === 'URGENT';
}

// ── Props ──────────────────────────────────────────────────────────────
interface DispatchDataTableProps {
  loads: DispatchLoad[];
  grouped: boolean;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  onLoadClick: (load: DispatchLoad) => void;
}

export function DispatchDataTable({
  loads,
  grouped,
  selectedIds,
  onSelectionChange,
  onLoadClick,
}: DispatchDataTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<KanbanLane>>(
    new Set()
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  // ── Group loads ────────────────────────────────────────────────────
  const groupedLoads = useMemo(() => {
    if (!grouped) return null;
    const groups = new Map<KanbanLane, DispatchLoad[]>();
    for (const lane of LANE_ORDER) {
      groups.set(lane, []);
    }
    for (const load of loads) {
      const lane = STATUS_TO_LANE[load.status];
      const arr = groups.get(lane);
      if (arr) arr.push(load);
    }
    return groups;
  }, [loads, grouped]);

  // ── Flat row list (for keyboard nav) ───────────────────────────────
  const flatRows = useMemo(() => {
    if (grouped && groupedLoads) {
      const rows: DispatchLoad[] = [];
      for (const lane of LANE_ORDER) {
        const group = groupedLoads.get(lane);
        if (!group?.length) continue;
        if (!collapsedGroups.has(lane)) {
          rows.push(...group);
        }
      }
      return rows;
    }
    return loads;
  }, [loads, grouped, groupedLoads, collapsedGroups]);

  // ── Toggle group ────────────────────────────────────────────────────
  const toggleGroup = useCallback((lane: KanbanLane) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(lane)) next.delete(lane);
      else next.add(lane);
      return next;
    });
  }, []);

  // ── Selection ────────────────────────────────────────────────────────
  const toggleSelect = useCallback(
    (id: number) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === loads.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(loads.map((l) => l.id)));
    }
  }, [loads, selectedIds, onSelectionChange]);

  // ── Keyboard navigation ──────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'checkbox') return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, flatRows.length - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < flatRows.length) {
        e.preventDefault();
        const load = flatRows[focusedIndex];
        if (load) onLoadClick(load);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [flatRows, focusedIndex, onLoadClick]);

  // ── Scroll focused row into view ─────────────────────────────────────
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < flatRows.length) {
      const load = flatRows[focusedIndex];
      if (load) {
        const row = rowRefs.current.get(load.id);
        row?.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, flatRows]);

  // ── Render a data row ────────────────────────────────────────────────
  function renderRow(load: DispatchLoad, index: number) {
    const lane = STATUS_TO_LANE[load.status];
    const atRisk = getIsAtRisk(load);
    const isSelected = selectedIds.has(load.id);
    const isFocused = flatRows[focusedIndex]?.id === load.id;
    const washCfg = STATUS_DISPLAY[lane];

    return (
      <tr
        key={load.id}
        ref={(el) => {
          if (el) rowRefs.current.set(load.id, el);
        }}
        onClick={() => onLoadClick(load)}
        className={cn(
          'group cursor-pointer transition-colors',
          'animate-in fade-in-0 slide-in-from-bottom-1 duration-300',
          // Status wash tinting
          washCfg.washClass,
          // Hover: glow style
          'hover:ring-1 hover:ring-slate-700/20 hover:z-[2] relative',
          // At risk: left red bar
          atRisk && 'shadow-[inset_3px_0_0_theme(colors.red.500)]',
          // Selected
          isSelected && 'bg-primary/[.06]',
          // Focused (keyboard)
          isFocused && 'ring-2 ring-inset ring-slate-700 z-[3]'
        )}
        style={{ animationDelay: `${index * 20}ms` }}
      >
        {/* Checkbox */}
        <td className="w-9 text-center px-2 py-1 border-r border-gray-200">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(load.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5"
          />
        </td>

        {/* Load # */}
        <td className="px-2.5 py-1 text-xs font-bold text-foreground border-r border-gray-200 whitespace-nowrap">
          {load.loadNumber}
        </td>

        {/* Status */}
        <td className="px-2.5 py-1 border-r border-gray-200">
          <StatusBadge lane={lane} atRisk={atRisk} />
        </td>

        {/* Origin */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
          {getOrigin(load)}
        </td>

        {/* Destination */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
          {getDestination(load)}
        </td>

        {/* Pickup */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap">
          {getPickupDate(load)}
        </td>

        {/* Delivery */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap">
          {getDeliveryDate(load)}
        </td>

        {/* Customer */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]">
          {load.customer.name}
        </td>

        {/* Carrier */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
          {load.carrier?.name ?? '—'}
        </td>

        {/* Equipment */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap">
          {formatEquipment(load.equipmentType)}
        </td>

        {/* Rate */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap tabular-nums">
          {formatRate(load.customerRate)}
        </td>

        {/* Weight */}
        <td className="px-2.5 py-1 text-xs text-foreground border-r border-gray-200 whitespace-nowrap tabular-nums">
          {formatWeight(load.weight)}
        </td>

        {/* Reference */}
        <td className="px-2.5 py-1 text-xs text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">
          {load.referenceNumbers?.[0] ?? '—'}
        </td>
      </tr>
    );
  }

  // ── Render group header ──────────────────────────────────────────────
  function renderGroupHeader(lane: KanbanLane, count: number) {
    const cfg = STATUS_DISPLAY[lane];
    const collapsed = collapsedGroups.has(lane);

    return (
      <tr
        key={`group-${lane}`}
        className="cursor-pointer select-none bg-white border-b border-gray-200"
        onClick={() => toggleGroup(lane)}
        style={{ boxShadow: `inset 4px 0 0 ${LANE_CONFIG[lane]?.color ?? '#6B7280'}` }}
      >
        <td colSpan={13} className="px-2.5 py-2 text-xs font-semibold text-foreground">
          <div className="flex items-center gap-2">
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform',
                collapsed && '-rotate-90'
              )}
            />
            <span className={cn('h-2 w-2 rounded-full', cfg.dotColor)} />
            {cfg.label}
            <span className="text-muted-foreground font-normal text-[11px]">
              ({count})
            </span>
          </div>
        </td>
      </tr>
    );
  }

  // ── Group separator ──────────────────────────────────────────────────
  function renderGroupSeparator(key: string) {
    return (
      <tr key={key}>
        <td colSpan={13} className="h-0 p-0 border-b-2 border-gray-300" />
      </tr>
    );
  }

  // ── Build table body ─────────────────────────────────────────────────
  function renderBody() {
    if (grouped && groupedLoads) {
      const rows: React.ReactNode[] = [];
      let flatIndex = 0;
      let isFirst = true;

      for (const lane of LANE_ORDER) {
        const group = groupedLoads.get(lane);
        if (!group?.length) continue;

        if (!isFirst) {
          rows.push(renderGroupSeparator(`sep-${lane}`));
        }
        isFirst = false;

        rows.push(renderGroupHeader(lane, group.length));

        if (!collapsedGroups.has(lane)) {
          for (const load of group) {
            rows.push(renderRow(load, flatIndex++));
          }
        }
      }
      return rows;
    }

    return loads.map((load, i) => renderRow(load, i));
  }

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <table ref={tableRef} className="w-full border-collapse min-w-[1100px]">
        <colgroup>
          <col style={{ width: 36 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 105 }} />
          <col style={{ width: 115 }} />
          <col style={{ width: 115 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 105 }} />
          <col style={{ width: 115 }} />
          <col style={{ width: 78 }} />
          <col style={{ width: 68 }} />
          <col style={{ width: 82 }} />
          <col style={{ width: 88 }} />
        </colgroup>
        <thead>
          <tr className="sticky top-0 z-10">
            <th className="h-[34px] px-2 text-center bg-gray-800 text-gray-50 text-[10px] font-semibold uppercase tracking-wider border-r border-gray-600">
              <Checkbox
                checked={loads.length > 0 && selectedIds.size === loads.length}
                onCheckedChange={toggleSelectAll}
                className="h-3.5 w-3.5"
              />
            </th>
            {[
              'Load #',
              'Status',
              'Origin',
              'Destination',
              'Pickup',
              'Delivery',
              'Customer',
              'Carrier',
              'Equipment',
              'Rate',
              'Weight',
              'Reference',
            ].map((col, i) => (
              <th
                key={col}
                className={cn(
                  'h-[34px] px-2.5 text-left bg-gray-800 text-gray-50 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap select-none',
                  i < 11 && 'border-r border-gray-600'
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}
