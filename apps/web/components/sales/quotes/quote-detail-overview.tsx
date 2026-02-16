"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Package,
  Truck,
  Calendar,
  Ruler,
  Clock,
  Weight,
  Layers,
} from "lucide-react";
import type { QuoteDetail } from "@/types/quotes";
import {
  SERVICE_TYPE_LABELS,
  EQUIPMENT_TYPE_FULL_LABELS,
} from "@/types/quotes";
import { cn } from "@/lib/utils";

interface QuoteDetailOverviewProps {
  quote: QuoteDetail;
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(value: number | undefined | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

function getMarginColor(percent: number | undefined | null): string {
  if (percent == null) return "text-muted-foreground";
  if (percent >= 15) return "text-green-600";
  if (percent >= 5) return "text-amber-600";
  return "text-red-600";
}

function getMarginBarColor(percent: number | undefined | null): string {
  if (percent == null) return "bg-muted";
  if (percent >= 15) return "bg-green-500";
  if (percent >= 5) return "bg-amber-500";
  return "bg-red-500";
}

// --- Shipment Details ---

function ShipmentDetailsCard({ quote }: { quote: QuoteDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Shipment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-muted-foreground text-xs">Service</div>
              <Badge variant="secondary" className="mt-0.5">
                {SERVICE_TYPE_LABELS[quote.serviceType] ?? quote.serviceType}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-muted-foreground text-xs">Equipment</div>
              <div className="font-medium">
                {EQUIPMENT_TYPE_FULL_LABELS[quote.equipmentType] ?? quote.equipmentType}
              </div>
            </div>
          </div>

          {quote.commodity && (
            <div className="flex items-start gap-2">
              <Layers className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground text-xs">Commodity</div>
                <div className="font-medium">{quote.commodity}</div>
              </div>
            </div>
          )}

          {quote.weight != null && (
            <div className="flex items-start gap-2">
              <Weight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground text-xs">Weight</div>
                <div className="font-medium">{formatNumber(quote.weight)} lbs</div>
              </div>
            </div>
          )}

          {(quote.pieces != null || quote.pallets != null) && (
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground text-xs">Pieces / Pallets</div>
                <div className="font-medium">
                  {quote.pieces != null ? `${quote.pieces} pcs` : ""}
                  {quote.pieces != null && quote.pallets != null ? " / " : ""}
                  {quote.pallets != null ? `${quote.pallets} pallets` : ""}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-muted-foreground text-xs">Pickup</div>
              <div className="font-medium">{formatDate(quote.pickupDate)}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-muted-foreground text-xs">Delivery</div>
              <div className="font-medium">{formatDate(quote.deliveryDate)}</div>
            </div>
          </div>

          {quote.distance != null && (
            <div className="flex items-start gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground text-xs">Distance</div>
                <div className="font-medium">{formatNumber(quote.distance)} mi</div>
              </div>
            </div>
          )}

          {quote.transitTime && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground text-xs">Transit</div>
                <div className="font-medium">{quote.transitTime}</div>
              </div>
            </div>
          )}
        </div>

        {quote.specialHandling && quote.specialHandling.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {quote.specialHandling.map((flag) => (
              <Badge key={flag} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {flag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Route / Stops ---

function RouteCard({ quote }: { quote: QuoteDetail }) {
  const stops = quote.stops ?? [];
  if (stops.length === 0) {
    // Fallback to origin/destination from base quote
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StopItem
            type="PICKUP"
            city={quote.originCity}
            state={quote.originState}
            sequence={1}
          />
          <StopItem
            type="DELIVERY"
            city={quote.destinationCity}
            state={quote.destinationState}
            sequence={2}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stops
          .sort((a, b) => a.sequence - b.sequence)
          .map((stop) => (
            <StopItem
              key={stop.id}
              type={stop.type}
              city={stop.city}
              state={stop.state}
              facilityName={stop.facilityName}
              appointmentDate={stop.appointmentDate}
              sequence={stop.sequence}
            />
          ))}
      </CardContent>
    </Card>
  );
}

function StopItem({
  type,
  city,
  state,
  facilityName,
  appointmentDate,
  sequence,
}: {
  type: string;
  city: string;
  state: string;
  facilityName?: string;
  appointmentDate?: string;
  sequence: number;
}) {
  const isPickup = type === "PICKUP";
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "flex items-center justify-center h-7 w-7 rounded-full shrink-0 text-xs font-bold",
        isPickup
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      )}>
        <MapPin className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="font-medium text-sm">
          {city}, {state}
          <span className="text-muted-foreground font-normal ml-1.5">
            ({isPickup ? "Pickup" : type === "DELIVERY" ? "Delivery" : `Stop ${sequence}`})
          </span>
        </div>
        {facilityName && (
          <div className="text-xs text-muted-foreground">{facilityName}</div>
        )}
        {appointmentDate && (
          <div className="text-xs text-muted-foreground">{formatDate(appointmentDate)}</div>
        )}
      </div>
    </div>
  );
}

// --- Rate Breakdown ---

function RateBreakdownCard({ quote }: { quote: QuoteDetail }) {
  const marginPercent = quote.marginPercent;
  const marginAmount = quote.marginAmount;
  const ratePerMile =
    quote.ratePerMile ??
    (quote.distance ? quote.totalAmount / quote.distance : undefined);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Rate Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Linehaul Rate</span>
            <span className="font-mono font-medium">
              {formatCurrency(quote.linehaulRate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Fuel Surcharge
              {quote.fuelSurcharge != null && (
                <span className="text-xs ml-1">(Auto)</span>
              )}
            </span>
            <span className="font-mono font-medium">
              {formatCurrency(quote.fuelSurcharge)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accessorials</span>
            <span className="font-mono font-medium">
              {formatCurrency(quote.accessorialsTotal)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="font-mono font-bold text-lg">
              {formatCurrency(quote.totalAmount)}
            </span>
          </div>
        </div>

        {/* Margin */}
        {marginPercent != null && (
          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Margin</span>
              <span className={cn("font-mono font-semibold", getMarginColor(marginPercent))}>
                {formatCurrency(marginAmount)} ({marginPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getMarginBarColor(marginPercent))}
                style={{ width: `${Math.min(Math.max(marginPercent, 0), 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          {quote.rateSource && (
            <Badge variant="outline" className="text-xs">
              {quote.rateSource}
            </Badge>
          )}
          {ratePerMile != null && (
            <span className="font-mono">${ratePerMile.toFixed(2)}/mi</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Market Rate Comparison ---

function MarketRateCard({ quote }: { quote: QuoteDetail }) {
  const { marketRateLow, marketRateAvg, marketRateHigh, totalAmount } = quote;
  if (marketRateLow == null || marketRateHigh == null) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Market Rate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Market rate data unavailable for this lane.
          </p>
        </CardContent>
      </Card>
    );
  }

  const range = marketRateHigh - marketRateLow;
  const position = range > 0
    ? Math.min(Math.max(((totalAmount - marketRateLow) / range) * 100, 0), 100)
    : 50;

  const diff = marketRateAvg
    ? ((totalAmount - marketRateAvg) / marketRateAvg) * 100
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Market Rate Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Rate bar */}
        <div className="relative">
          <div className="h-2 rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-green-200" />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-sm rotate-45 bg-blue-600 border-2 border-white shadow-sm"
            style={{ left: `${position}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low {formatCurrency(marketRateLow)}</span>
          {marketRateAvg != null && (
            <span>Avg {formatCurrency(marketRateAvg)}</span>
          )}
          <span>High {formatCurrency(marketRateHigh)}</span>
        </div>

        {/* Summary */}
        {diff != null && (
          <p className={cn("text-xs font-medium", diff >= 0 ? "text-green-600" : "text-red-600")}>
            Your rate is {Math.abs(diff).toFixed(0)}% {diff >= 0 ? "above" : "below"} market average
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Sidebar ---

export function QuoteSummaryPanel({ quote }: { quote: QuoteDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Quote Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <SummaryRow label="Created" value={formatDate(quote.createdAt)} />
        <SummaryRow label="Sent" value={quote.sentAt ? formatDateTime(quote.sentAt) : "Not sent"} />
        <SummaryRow label="Viewed" value={quote.viewedAt ? formatDateTime(quote.viewedAt) : "Not viewed"} />
        <SummaryRow label="Expires" value={quote.expiryDate ? formatDateWithCountdown(quote.expiryDate) : "—"} />

        <Separator />

        <SummaryRow label="Agent" value={quote.salesAgentName ?? "—"} />
        <SummaryRow label="Customer" value={quote.customerName ?? "—"} isLink />
        {quote.contactName && (
          <SummaryRow label="Contact" value={quote.contactName} />
        )}
        {quote.contactEmail && (
          <SummaryRow label="Email" value={quote.contactEmail} />
        )}
        {quote.contactPhone && (
          <SummaryRow label="Phone" value={quote.contactPhone} />
        )}

        {quote.convertedOrderNumber && (
          <>
            <Separator />
            <SummaryRow label="Order" value={quote.convertedOrderNumber} isLink />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium text-right", isLink && "text-primary")}>
        {value}
      </span>
    </div>
  );
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateWithCountdown(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (days <= 0) return `${formatted} (Expired)`;
  if (days === 1) return `${formatted} (1 day left)`;
  return `${formatted} (${days} days left)`;
}

// --- Main Export ---

export function QuoteDetailOverview({ quote }: QuoteDetailOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <ShipmentDetailsCard quote={quote} />
        <RouteCard quote={quote} />
        <RateBreakdownCard quote={quote} />
        <MarketRateCard quote={quote} />
      </div>
      <div className="space-y-6">
        <QuoteSummaryPanel quote={quote} />
      </div>
    </div>
  );
}
