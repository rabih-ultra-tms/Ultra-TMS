'use client';

/**
 * Quote Drawer Content — Command Center Entity Variant
 *
 * Renders quote details inside the UniversalDetailDrawer when entityType === 'quote'.
 * Fetches a single quote by ID via the existing useQuote hook and displays
 * overview, route, rate, and timeline sections.
 *
 * MP-05-007
 */

import {
  MapPin,
  DollarSign,
  Clock,
  FileText,
  ExternalLink,
  AlertTriangle,
  Loader2,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuote } from '@/lib/hooks/sales/use-quotes';
import type { QuoteDetail } from '@/types/quotes';
import {
  QUOTE_STATUS_LABELS,
  EQUIPMENT_TYPE_FULL_LABELS,
  SERVICE_TYPE_LABELS,
} from '@/types/quotes';

// ── Status badge colors ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-indigo-100 text-indigo-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  CONVERTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-amber-100 text-amber-800',
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

// ── Section Components ─────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: typeof FileText;
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

interface QuoteDrawerContentProps {
  quoteId: string;
}

export function QuoteDrawerContent({ quoteId }: QuoteDrawerContentProps) {
  const { data: quote, isLoading, isError, error } = useQuote(quoteId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="h-8 w-8 text-destructive/60" />
        <p className="text-sm text-destructive">Failed to load quote</p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const q = quote as QuoteDetail;

  const pickup = q.stops?.find((s) => s.type === 'PICKUP');
  const delivery = q.stops?.find((s) => s.type === 'DELIVERY');

  return (
    <div className="space-y-5 p-5">
      {/* ── Header: Quote number + Status ────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quote #{q.quoteNumber}</h3>
          <p className="text-xs text-muted-foreground">
            v{q.version} &middot; {q.customerName ?? 'Unknown Customer'}
          </p>
        </div>
        <Badge className={STATUS_COLORS[q.status] ?? 'bg-slate-100 text-slate-700'}>
          {QUOTE_STATUS_LABELS[q.status] ?? q.status}
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
                {pickup
                  ? `${pickup.city}, ${pickup.state}`
                  : `${q.originCity}, ${q.originState}`}
              </p>
              {pickup?.facilityName && (
                <p className="text-xs text-muted-foreground">
                  {pickup.facilityName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Pickup: {formatDate(q.pickupDate ?? pickup?.appointmentDate)}
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
                {delivery
                  ? `${delivery.city}, ${delivery.state}`
                  : `${q.destinationCity}, ${q.destinationState}`}
              </p>
              {delivery?.facilityName && (
                <p className="text-xs text-muted-foreground">
                  {delivery.facilityName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Delivery: {formatDate(q.deliveryDate ?? delivery?.appointmentDate)}
              </p>
            </div>
          </div>

          {q.distance != null && (
            <p className="text-xs text-muted-foreground text-right">
              {q.distance.toLocaleString()} miles
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Shipment Details ──────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={FileText} label="Shipment" />
        <div className="space-y-1.5">
          <InfoRow
            label="Service"
            value={SERVICE_TYPE_LABELS[q.serviceType] ?? q.serviceType}
          />
          <InfoRow
            label="Equipment"
            value={
              EQUIPMENT_TYPE_FULL_LABELS[q.equipmentType] ?? q.equipmentType
            }
          />
          {q.commodity && <InfoRow label="Commodity" value={q.commodity} />}
          {q.weight != null && (
            <InfoRow label="Weight" value={`${q.weight.toLocaleString()} lbs`} />
          )}
          {q.transitTime && (
            <InfoRow label="Transit" value={q.transitTime} />
          )}
        </div>
      </div>

      <Separator />

      {/* ── Rate Breakdown ────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={DollarSign} label="Rate" />
        <div className="space-y-1.5">
          {q.linehaulRate != null && (
            <InfoRow label="Linehaul" value={formatCurrency(q.linehaulRate)} />
          )}
          {q.fuelSurcharge != null && (
            <InfoRow
              label="Fuel Surcharge"
              value={formatCurrency(q.fuelSurcharge)}
            />
          )}
          {q.accessorialsTotal != null && (
            <InfoRow
              label="Accessorials"
              value={formatCurrency(q.accessorialsTotal)}
            />
          )}
          <InfoRow
            label="Total"
            value={
              <span className="font-semibold">
                {formatCurrency(q.totalAmount)}
              </span>
            }
          />
          {q.ratePerMile != null && (
            <InfoRow
              label="Rate/Mile"
              value={formatCurrency(q.ratePerMile)}
            />
          )}
        </div>
      </div>

      {/* ── Margin ────────────────────────────────────────────────── */}
      {(q.marginPercent != null || q.estimatedCost != null) && (
        <>
          <Separator />
          <div className="space-y-2">
            <SectionHeader icon={TrendingUp} label="Margin" />
            <div className="space-y-1.5">
              {q.estimatedCost != null && (
                <InfoRow
                  label="Est. Cost"
                  value={formatCurrency(q.estimatedCost)}
                />
              )}
              {q.marginPercent != null && (
                <InfoRow
                  label="Margin"
                  value={`${q.marginPercent.toFixed(1)}%`}
                />
              )}
              {q.marginAmount != null && (
                <InfoRow
                  label="Margin $"
                  value={formatCurrency(q.marginAmount)}
                />
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* ── Contact & Timeline ────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Clock} label="Timeline" />
        <div className="space-y-1.5">
          <InfoRow label="Created" value={formatDate(q.createdAt)} />
          {q.sentAt && <InfoRow label="Sent" value={formatDate(q.sentAt)} />}
          {q.viewedAt && (
            <InfoRow label="Viewed" value={formatDate(q.viewedAt)} />
          )}
          {q.acceptedAt && (
            <InfoRow label="Accepted" value={formatDate(q.acceptedAt)} />
          )}
          {q.rejectedAt && (
            <InfoRow label="Rejected" value={formatDate(q.rejectedAt)} />
          )}
          {q.expiryDate && (
            <InfoRow label="Expires" value={formatDate(q.expiryDate)} />
          )}
        </div>
      </div>

      {q.contactName && (
        <>
          <Separator />
          <div className="space-y-2">
            <SectionHeader icon={User} label="Contact" />
            <div className="space-y-1.5">
              <InfoRow label="Name" value={q.contactName} />
              {q.contactEmail && (
                <InfoRow label="Email" value={q.contactEmail} />
              )}
              {q.contactPhone && (
                <InfoRow label="Phone" value={q.contactPhone} />
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Converted Order ───────────────────────────────────────── */}
      {q.convertedOrderNumber && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-3">
          <p className="text-xs text-emerald-800 dark:text-emerald-400">
            Converted to Order{' '}
            <Link
              href={`/operations/orders/${q.convertedOrderId}`}
              className="font-medium underline"
            >
              #{q.convertedOrderNumber}
            </Link>
          </p>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/quotes/${q.id}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open Full Detail
          </Link>
        </Button>
      </div>
    </div>
  );
}
