"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertTriangle,
  Calculator,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalculateRate } from "@/lib/hooks/sales/use-quotes";
import type { QuoteFormValues, CalculateRateResponse } from "@/types/quotes";

interface QuoteRateSectionProps {
  form: UseFormReturn<QuoteFormValues>;
  rateData: CalculateRateResponse | null;
  onRateDataChange: (data: CalculateRateResponse | null) => void;
}

const MIN_MARGIN_PERCENT = 15;

function formatCurrency(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getMarginColor(percent: number): string {
  if (percent >= 15) return "text-green-600";
  if (percent >= 5) return "text-amber-600";
  return "text-red-600";
}

function getMarginBarColor(percent: number): string {
  if (percent >= 15) return "bg-green-500";
  if (percent >= 5) return "bg-amber-500";
  return "bg-red-500";
}

export function QuoteRateSection({
  form,
  rateData,
  onRateDataChange,
}: QuoteRateSectionProps) {
  const calculateRate = useCalculateRate();

  const { fields: accessorials, append, remove } = useFieldArray({
    control: form.control,
    name: "accessorials",
  });

  const linehaulRate = form.watch("linehaulRate") ?? 0;
  const fuelSurcharge = form.watch("fuelSurcharge") ?? 0;
  const accessorialValues = form.watch("accessorials") ?? [];

  const accessorialsTotal = accessorialValues.reduce(
    (sum, acc) => sum + (acc.amount || 0),
    0
  );
  const totalAmount = linehaulRate + fuelSurcharge + accessorialsTotal;
  const estimatedCost = rateData?.estimatedCost ?? 0;
  const marginAmount = estimatedCost > 0 ? totalAmount - estimatedCost : 0;
  const marginPercent =
    totalAmount > 0 && estimatedCost > 0
      ? (marginAmount / totalAmount) * 100
      : 0;
  const ratePerMile =
    rateData?.distance && rateData.distance > 0
      ? totalAmount / rateData.distance
      : 0;

  const handleCalculateRate = () => {
    const stops = form.getValues("stops");
    const pickup = stops.find((s) => s.type === "PICKUP") ?? stops[0];
    const delivery =
      stops.find((s) => s.type === "DELIVERY") ?? stops[stops.length - 1];

    if (!pickup?.city || !pickup?.state || !delivery?.city || !delivery?.state) {
      return;
    }

    calculateRate.mutate(
      {
        originCity: pickup.city,
        originState: pickup.state,
        destinationCity: delivery.city,
        destinationState: delivery.state,
        equipmentType: form.getValues("equipmentType"),
        weight: form.getValues("weight") ?? undefined,
        customerId: form.getValues("customerId") || undefined,
      },
      {
        onSuccess: (data) => {
          onRateDataChange(data);
          form.setValue("linehaulRate", data.linehaulRate, {
            shouldDirty: true,
          });
          if (data.fuelSurcharge) {
            form.setValue("fuelSurcharge", data.fuelSurcharge, {
              shouldDirty: true,
            });
          }
        },
      }
    );
  };

  const handleAddAccessorial = () => {
    append({
      type: "",
      rateType: "FLAT",
      amount: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Rate Input Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Rate & Pricing</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCalculateRate}
            disabled={calculateRate.isPending}
          >
            {calculateRate.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calculate Rate
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linehaulRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linehaul Rate *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="pl-7 font-mono"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fuelSurcharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Surcharge</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="pl-7 font-mono"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Accessorials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm">Accessorials</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddAccessorial}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>

          {accessorials.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name={`accessorials.${index}.type`}
                render={({ field: f }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Type (e.g. Detention)"
                        {...f}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`accessorials.${index}.rateType`}
                render={({ field: f }) => (
                  <FormItem className="w-[110px]">
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FLAT">Flat</SelectItem>
                        <SelectItem value="PER_MILE">Per Mile</SelectItem>
                        <SelectItem value="PER_CWT">Per CWT</SelectItem>
                        <SelectItem value="PERCENTAGE">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`accessorials.${index}.amount`}
                render={({ field: f }) => (
                  <FormItem className="w-[100px]">
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          className="h-9 pl-5 font-mono text-sm"
                          {...f}
                          value={f.value ?? ""}
                          onChange={(e) =>
                            f.onChange(
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Summary Card */}
      <RateSummaryCard
        linehaulRate={linehaulRate}
        fuelSurcharge={fuelSurcharge}
        accessorialsTotal={accessorialsTotal}
        totalAmount={totalAmount}
        marginAmount={marginAmount}
        marginPercent={marginPercent}
        ratePerMile={ratePerMile}
        rateData={rateData}
        rateSource={rateData?.rateSource}
      />
    </div>
  );
}

// --- Rate Summary (also used as sidebar on desktop) ---

interface RateSummaryCardProps {
  linehaulRate: number;
  fuelSurcharge: number;
  accessorialsTotal: number;
  totalAmount: number;
  marginAmount: number;
  marginPercent: number;
  ratePerMile: number;
  rateData: CalculateRateResponse | null;
  rateSource?: string;
}

export function RateSummaryCard({
  linehaulRate,
  fuelSurcharge,
  accessorialsTotal,
  totalAmount,
  marginAmount,
  marginPercent,
  ratePerMile,
  rateData,
  rateSource,
}: RateSummaryCardProps) {
  const hasMarginData = marginPercent !== 0 || marginAmount !== 0;
  const belowMinMargin = hasMarginData && marginPercent < MIN_MARGIN_PERCENT;

  return (
    <Card className="border-t-3 border-t-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Rate Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Line items */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Linehaul</span>
            <span className="font-mono font-medium">
              {formatCurrency(linehaulRate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fuel Surcharge</span>
            <span className="font-mono font-medium">
              {formatCurrency(fuelSurcharge)}
            </span>
          </div>
          {accessorialsTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accessorials</span>
              <span className="font-mono font-medium">
                {formatCurrency(accessorialsTotal)}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="font-mono font-bold text-lg">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Margin */}
        {hasMarginData && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Margin</span>
              <span
                className={cn(
                  "font-mono font-semibold",
                  getMarginColor(marginPercent)
                )}
              >
                {formatCurrency(marginAmount)} ({marginPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  getMarginBarColor(marginPercent)
                )}
                style={{
                  width: `${Math.min(Math.max(marginPercent, 0), 100)}%`,
                }}
              />
            </div>
            {belowMinMargin && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
                <AlertTriangle className="h-3 w-3" />
                Below {MIN_MARGIN_PERCENT}% minimum margin
              </div>
            )}
          </div>
        )}

        {/* Rate per mile */}
        {ratePerMile > 0 && (
          <div className="text-xs text-muted-foreground pt-1">
            Rate Per Mile:{" "}
            <span className="font-mono">${ratePerMile.toFixed(2)}/mi</span>
          </div>
        )}

        {/* Market rates */}
        {rateData?.marketRateLow != null && rateData?.marketRateHigh != null && (
          <>
            <Separator />
            <MarketRateDisplay
              low={rateData.marketRateLow}
              avg={rateData.marketRateAvg}
              high={rateData.marketRateHigh}
              quoteRate={totalAmount}
            />
          </>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 pt-1">
          {rateSource && (
            <Badge variant="outline" className="text-xs">
              {rateSource}
            </Badge>
          )}
          {rateData?.distance && (
            <span className="text-xs text-muted-foreground">
              {rateData.distance} mi
            </span>
          )}
          {rateData?.transitTime && (
            <span className="text-xs text-muted-foreground">
              ~{rateData.transitTime}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Market Rate Comparison ---

function MarketRateDisplay({
  low,
  avg,
  high,
  quoteRate,
}: {
  low: number;
  avg?: number;
  high: number;
  quoteRate: number;
}) {
  const range = high - low;
  const position =
    range > 0
      ? Math.min(Math.max(((quoteRate - low) / range) * 100, 0), 100)
      : 50;

  const diff = avg ? ((quoteRate - avg) / avg) * 100 : null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">
        Market Rates
      </div>

      <div className="relative">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-green-200" />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-sm rotate-45 bg-blue-600 border-2 border-white shadow-sm"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Low {formatCurrency(low)}</span>
        {avg != null && <span>Avg {formatCurrency(avg)}</span>}
        <span>High {formatCurrency(high)}</span>
      </div>

      {diff != null && (
        <p
          className={cn(
            "text-xs font-medium",
            diff >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {Math.abs(diff).toFixed(0)}% {diff >= 0 ? "above" : "below"} market
          avg
        </p>
      )}
    </div>
  );
}
