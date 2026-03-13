'use client';

/**
 * Carrier Drawer Content — Command Center Entity Variant
 *
 * Renders carrier details inside the UniversalDetailDrawer when entityType === 'carrier'.
 * Fetches a single carrier by ID via the existing useCarrier hook and displays
 * overview, insurance, performance, and equipment sections.
 *
 * MP-05-006
 */

import {
  Truck,
  MapPin,
  Phone,
  Mail,
  Shield,
  ExternalLink,
  AlertTriangle,
  Loader2,
  BarChart3,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TierBadge } from '@/components/carriers/tier-badge';
import { useCarrier } from '@/lib/hooks/operations/use-carriers';
import type { OperationsCarrier } from '@/types/carriers';
import { CARRIER_EQUIPMENT_TYPE_LABELS } from '@/types/carriers';

// ── Status badge colors ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-slate-100 text-slate-700',
  SUSPENDED: 'bg-red-100 text-red-800',
  BLACKLISTED: 'bg-red-100 text-red-800',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(cents?: number) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPercent(value?: number) {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

// ── Section Components ─────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: typeof Building2;
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
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function InsuranceStatus({ carrier }: { carrier: OperationsCarrier }) {
  if (!carrier.insuranceExpiryDate) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No insurance on file
      </p>
    );
  }

  const expiry = new Date(carrier.insuranceExpiryDate);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 30;

  return (
    <div className="space-y-2">
      {(isExpired || isExpiringSoon) && (
        <div
          className={`flex items-center gap-2 rounded-md p-2 text-xs ${
            isExpired
              ? 'bg-red-50 text-red-800 dark:bg-red-950/30'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {isExpired
            ? `Insurance expired ${formatDate(carrier.insuranceExpiryDate)}`
            : `Expires in ${daysRemaining}d`}
        </div>
      )}
      {carrier.insuranceCompany && (
        <InfoRow label="Insurer" value={carrier.insuranceCompany} />
      )}
      {carrier.insurancePolicyNumber && (
        <InfoRow label="Policy #" value={carrier.insurancePolicyNumber} mono />
      )}
      {carrier.cargoInsuranceLimitCents != null && (
        <InfoRow
          label="Cargo Limit"
          value={formatCurrency(carrier.cargoInsuranceLimitCents)}
        />
      )}
      <InfoRow label="Expiry" value={formatDate(carrier.insuranceExpiryDate)} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

interface CarrierDrawerContentProps {
  carrierId: string;
}

export function CarrierDrawerContent({
  carrierId,
}: CarrierDrawerContentProps) {
  const { data, isLoading, isError, error } = useCarrier(carrierId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // useCarrier returns { data: OperationsCarrier } wrapped in API envelope
  const carrier = (data as { data?: OperationsCarrier })?.data ?? data;

  if (isError || !carrier) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="h-8 w-8 text-destructive/60" />
        <p className="text-sm text-destructive">Failed to load carrier</p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const c = carrier as OperationsCarrier;

  return (
    <div className="space-y-5 p-5">
      {/* ── Header: Name + Status + Tier ─────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate">{c.companyName}</h3>
          <div className="flex items-center gap-2 mt-1">
            {c.mcNumber && (
              <span className="text-xs text-muted-foreground font-mono">
                MC-{c.mcNumber}
              </span>
            )}
            {c.dotNumber && (
              <span className="text-xs text-muted-foreground font-mono">
                DOT# {c.dotNumber}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TierBadge tier={c.tier} size="sm" />
          <Badge className={STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-700'}>
            {c.status}
          </Badge>
        </div>
      </div>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Building2} label="Contact" />
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">
              {c.city}, {c.state} {c.zip}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <a href={`tel:${c.phone}`} className="text-sm hover:underline">
              {c.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <a
              href={`mailto:${c.email}`}
              className="text-sm hover:underline truncate"
            >
              {c.email}
            </a>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Performance ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={BarChart3} label="Performance" />
        <div className="space-y-1.5">
          <InfoRow
            label="On-Time Pickup"
            value={formatPercent(c.onTimePickupRate)}
          />
          <InfoRow
            label="On-Time Delivery"
            value={formatPercent(c.onTimeDeliveryRate)}
          />
          <InfoRow label="Claims Rate" value={formatPercent(c.claimsRate)} />
          <InfoRow
            label="Acceptance Rate"
            value={formatPercent(c.acceptanceRate)}
          />
          <InfoRow
            label="Loads Completed"
            value={c.totalLoadsCompleted?.toLocaleString()}
          />
          {c.performanceScore != null && (
            <InfoRow
              label="Score"
              value={
                <span className="font-semibold">
                  {c.performanceScore.toFixed(1)}/100
                </span>
              }
            />
          )}
        </div>
      </div>

      <Separator />

      {/* ── Equipment ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Truck} label="Equipment" />
        <div className="space-y-1.5">
          {c.equipmentTypes && c.equipmentTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {c.equipmentTypes.map((eq) => (
                <Badge key={eq} variant="outline" className="text-xs">
                  {CARRIER_EQUIPMENT_TYPE_LABELS[eq] ?? eq}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No equipment listed
            </p>
          )}
          {c.truckCount != null && (
            <InfoRow label="Trucks" value={c.truckCount} />
          )}
          {c.trailerCount != null && (
            <InfoRow label="Trailers" value={c.trailerCount} />
          )}
        </div>
      </div>

      <Separator />

      {/* ── Insurance ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionHeader icon={Shield} label="Insurance" />
        <InsuranceStatus carrier={c} />
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/carriers/${c.id}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open Full Detail
          </Link>
        </Button>
      </div>
    </div>
  );
}
