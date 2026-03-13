'use client';

/**
 * Load Drawer Content — Command Center Entity Variant
 *
 * Renders load details inside the UniversalDetailDrawer when entityType === 'load'.
 * Fetches a single load by ID via the existing useLoad hook and displays
 * overview, route, carrier, and finance sections.
 *
 * MP-05-005
 */

import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  AlertTriangle,
  Package,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLoad } from '@/lib/hooks/tms/use-loads';

// ── Status badge colors ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  TENDERED: 'bg-violet-100 text-violet-800',
  ACCEPTED: 'bg-cyan-100 text-cyan-800',
  ASSIGNED: 'bg-cyan-100 text-cyan-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  AT_PICKUP: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  AT_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const EQUIPMENT_LABELS: Record<string, string> = {
  DRY_VAN: 'Dry Van',
  REEFER: 'Reefer',
  FLATBED: 'Flatbed',
  STEP_DECK: 'Step Deck',
  OTHER: 'Other',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(amount?: number) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

// ── Section Components ─────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: typeof Package;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value ?? '—'}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

interface LoadDrawerContentProps {
  loadId: string;
}

export function LoadDrawerContent({ loadId }: LoadDrawerContentProps) {
  const { data: load, isLoading, isError, error } = useLoad(loadId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !load) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="h-8 w-8 text-destructive/60" />
        <p className="text-sm text-destructive">Failed to load details</p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const pickup = load.stops?.find(
    (s) => (s.stopType as string) === 'PICKUP' || (s.stopType as string) === 'PICK_UP'
  );
  const delivery = load.stops?.find(
    (s) => (s.stopType as string) === 'DELIVERY' || (s.stopType as string) === 'DELIVER'
  );
  // Also check order.stops if top-level stops are absent
  const orderPickup = load.order?.stops?.find(
    (s) => (s.stopType as string) === 'PICKUP' || (s.stopType as string) === 'PICK_UP'
  );
  const orderDelivery = load.order?.stops?.find(
    (s) => (s.stopType as string) === 'DELIVERY' || (s.stopType as string) === 'DELIVER'
  );
  const origin = pickup ?? orderPickup;
  const dest = delivery ?? orderDelivery;

  return (
    <div className="space-y-5 p-5">
      {/* ── Header: Load number + Status ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Load #{load.loadNumber}</h3>
          {load.order?.orderNumber && (
            <p className="text-xs text-muted-foreground">
              Order: {load.order.orderNumber}
            </p>
          )}
        </div>
        <Badge
          className={
            STATUS_COLORS[load.status] ?? 'bg-slate-100 text-slate-700'
          }
        >
          {formatStatus(load.status)}
        </Badge>
      </div>

      {/* ── Route ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionHeader icon={MapPin} label="Route" />
        <div className="rounded-lg border p-3 space-y-3">
          {/* Origin */}
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {origin
                  ? `${origin.city}, ${origin.state}`
                  : load.originCity
                    ? `${load.originCity}, ${load.originState}`
                    : '—'}
              </p>
              {(origin as typeof orderPickup)?.facilityName && (
                <p className="text-xs text-muted-foreground">
                  {(origin as typeof orderPickup)?.facilityName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Pickup: {formatDate(load.pickupDate ?? (origin as typeof orderPickup)?.appointmentDate)}
              </p>
            </div>
          </div>

          {/* Dashed connector */}
          <div className="ml-[3px] h-4 border-l-2 border-dashed border-muted-foreground/30" />

          {/* Destination */}
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {dest
                  ? `${dest.city}, ${dest.state}`
                  : load.destinationCity
                    ? `${load.destinationCity}, ${load.destinationState}`
                    : '—'}
              </p>
              {(dest as typeof orderDelivery)?.facilityName && (
                <p className="text-xs text-muted-foreground">
                  {(dest as typeof orderDelivery)?.facilityName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Delivery: {formatDate(load.deliveryDate ?? (dest as typeof orderDelivery)?.appointmentDate)}
              </p>
            </div>
          </div>

          {load.miles != null && (
            <p className="text-xs text-muted-foreground text-right">
              {load.miles.toLocaleString()} miles
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Shipment Details ─────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Package} label="Shipment" />
        <div className="space-y-1.5">
          <InfoRow
            label="Equipment"
            value={
              load.equipmentType
                ? EQUIPMENT_LABELS[load.equipmentType] ?? load.equipmentType
                : '—'
            }
          />
          {load.commodity && (
            <InfoRow label="Commodity" value={load.commodity} />
          )}
          {load.weight != null && (
            <InfoRow
              label="Weight"
              value={`${load.weight.toLocaleString()} lbs`}
            />
          )}
          {load.temperature != null && (
            <InfoRow label="Temp" value={`${load.temperature}°F`} />
          )}
          <InfoRow label="Customer" value={load.order?.customer?.name} />
          {load.customerReference && (
            <InfoRow label="Ref #" value={load.customerReference} />
          )}
        </div>
      </div>

      <Separator />

      {/* ── Carrier ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Truck} label="Carrier" />
        {load.carrier ? (
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-medium">{load.carrier.legalName}</p>
            <p className="text-xs text-muted-foreground">
              MC# {load.carrier.mcNumber}
            </p>
            {load.driverName && (
              <InfoRow label="Driver" value={load.driverName} />
            )}
            {load.driverPhone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <a href={`tel:${load.driverPhone}`} className="hover:underline">
                  {load.driverPhone}
                </a>
              </div>
            )}
            {load.carrier.dispatchEmail && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <a
                  href={`mailto:${load.carrier.dispatchEmail}`}
                  className="hover:underline truncate"
                >
                  {load.carrier.dispatchEmail}
                </a>
              </div>
            )}
            {load.truckNumber && (
              <InfoRow label="Truck" value={load.truckNumber} />
            )}
            {load.trailerNumber && (
              <InfoRow label="Trailer" value={load.trailerNumber} />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No carrier assigned
          </p>
        )}
      </div>

      <Separator />

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Clock} label="Timeline" />
        <div className="space-y-1.5">
          <InfoRow label="Created" value={formatDate(load.createdAt)} />
          {load.dispatchedAt && (
            <InfoRow label="Dispatched" value={formatDate(load.dispatchedAt)} />
          )}
          {load.pickedUpAt && (
            <InfoRow label="Picked Up" value={formatDate(load.pickedUpAt)} />
          )}
          {load.deliveredAt && (
            <InfoRow label="Delivered" value={formatDate(load.deliveredAt)} />
          )}
          {load.eta && <InfoRow label="ETA" value={formatDate(load.eta)} />}
        </div>
      </div>

      <Separator />

      {/* ── Finance ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={DollarSign} label="Finance" />
        <div className="space-y-1.5">
          <InfoRow
            label="Carrier Rate"
            value={formatCurrency(load.carrierRate)}
          />
          {load.accessorialCosts != null && (
            <InfoRow
              label="Accessorials"
              value={formatCurrency(load.accessorialCosts)}
            />
          )}
          {load.fuelSurcharge != null && (
            <InfoRow
              label="Fuel Surcharge"
              value={formatCurrency(load.fuelSurcharge)}
            />
          )}
          {load.totalCost != null && (
            <InfoRow
              label="Total Cost"
              value={
                <span className="font-semibold">
                  {formatCurrency(load.totalCost)}
                </span>
              }
            />
          )}
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/operations/loads/${load.id}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open Full Detail
          </Link>
        </Button>
      </div>
    </div>
  );
}
