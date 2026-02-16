"use client";

import { UseFormReturn } from "react-hook-form";
import { CheckCircle2, AlertCircle, MapPin, DollarSign, Package, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  EQUIPMENT_TYPE_CONFIG,
  PAYMENT_TERMS_LABELS,
  ACCESSORIAL_TYPE_LABELS,
  SPECIAL_HANDLING_OPTIONS,
  type OrderFormValues,
  type OrderEquipmentType,
  type AccessorialValues,
  type StopFormValues,
} from "./order-form-schema";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

interface OrderReviewStepProps {
  form: UseFormReturn<OrderFormValues>;
  values: OrderFormValues;
}

export function OrderReviewStep({ form, values }: OrderReviewStepProps) {
  const totalAccessorials = values.accessorials.reduce(
    (sum: number, a: AccessorialValues) => sum + (a.amount || 0),
    0
  );
  const totalCharges =
    (values.customerRate || 0) +
    (values.fuelSurcharge || 0) +
    totalAccessorials;

  const marginDollars =
    values.customerRate && values.estimatedCarrierRate
      ? values.customerRate - values.estimatedCarrierRate
      : null;
  const marginPercent =
    values.customerRate && values.estimatedCarrierRate && values.customerRate > 0
      ? ((values.customerRate - values.estimatedCarrierRate) / values.customerRate) * 100
      : null;

  const errors = form.formState.errors;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      {hasErrors && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Please fix the following errors before confirming:
                </p>
                <ul className="mt-1 text-sm text-destructive list-disc list-inside">
                  {Object.entries(errors).map(([key, error]: [string, any]) => (
                    <li key={key}>
                      {typeof error?.message === "string"
                        ? error.message
                        : `${key} has an error`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasErrors && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700">
                All validations passed. Ready to submit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer & Reference */}
      <ReviewSection
        icon={<User className="h-4 w-4" />}
        title="Customer & Reference"
      >
        <ReviewRow label="Customer" value={values.customerName || "—"} />
        {values.customerReferenceNumber && (
          <ReviewRow label="Customer Ref" value={values.customerReferenceNumber} />
        )}
        {values.poNumber && (
          <ReviewRow label="PO Number" value={values.poNumber} />
        )}
        {values.bolNumber && (
          <ReviewRow label="BOL Number" value={values.bolNumber} />
        )}
        <ReviewRow
          label="Priority"
          value={
            <Badge className={cn("text-xs", PRIORITY_COLORS[values.priority])}>
              {values.priority}
            </Badge>
          }
        />
        {values.internalNotes && (
          <ReviewRow label="Notes" value={values.internalNotes} />
        )}
      </ReviewSection>

      {/* Cargo Details */}
      <ReviewSection
        icon={<Package className="h-4 w-4" />}
        title="Cargo Details"
      >
        <ReviewRow label="Commodity" value={values.commodity || "—"} />
        <ReviewRow
          label="Weight"
          value={
            values.weight
              ? `${values.weight.toLocaleString()} lbs`
              : "—"
          }
        />
        {values.pieces && (
          <ReviewRow label="Pieces" value={values.pieces.toString()} />
        )}
        {values.pallets && (
          <ReviewRow label="Pallets" value={values.pallets.toString()} />
        )}
        <ReviewRow
          label="Equipment"
          value={
            EQUIPMENT_TYPE_CONFIG[values.equipmentType as OrderEquipmentType]?.label ||
            values.equipmentType
          }
        />
        {values.isHazmat && (
          <>
            <ReviewRow label="Hazmat" value="Yes" />
            {values.hazmatUnNumber && (
              <ReviewRow label="UN Number" value={values.hazmatUnNumber} />
            )}
            {values.hazmatClass && (
              <ReviewRow label="Hazmat Class" value={values.hazmatClass} />
            )}
          </>
        )}
        {values.equipmentType === "REEFER" && (
          <ReviewRow
            label="Temperature"
            value={`${values.tempMin ?? "—"}°F — ${values.tempMax ?? "—"}°F`}
          />
        )}
        {values.specialHandling.length > 0 && (
          <ReviewRow
            label="Special Handling"
            value={values.specialHandling
              .map(
                (v: string) =>
                  SPECIAL_HANDLING_OPTIONS.find((o) => o.value === v)
                    ?.label || v
              )
              .join(", ")}
          />
        )}
      </ReviewSection>

      {/* Stops */}
      <ReviewSection
        icon={<MapPin className="h-4 w-4" />}
        title={`Stops (${values.stops.length})`}
      >
        {values.stops.map((stop: StopFormValues, index: number) => (
          <div
            key={stop.id || index}
            className="flex items-start gap-3 py-2"
          >
            <Badge
              variant="outline"
              className={cn(
                "text-xs shrink-0 mt-0.5",
                stop.type === "PICKUP"
                  ? "bg-blue-100 text-blue-800"
                  : stop.type === "DELIVERY"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
              )}
            >
              {stop.type}
            </Badge>
            <div className="text-sm">
              {stop.facilityName && (
                <div className="font-medium">{stop.facilityName}</div>
              )}
              <div>
                {[stop.address, stop.city, stop.state, stop.zipCode]
                  .filter(Boolean)
                  .join(", ") || "Address not set"}
              </div>
              {stop.appointmentDate && (
                <div className="text-muted-foreground">
                  {stop.appointmentDate}
                  {stop.appointmentTimeFrom &&
                    ` ${stop.appointmentTimeFrom}`}
                  {stop.appointmentTimeTo &&
                    ` – ${stop.appointmentTimeTo}`}
                </div>
              )}
              {stop.instructions && (
                <div className="text-muted-foreground italic">
                  {stop.instructions}
                </div>
              )}
            </div>
          </div>
        ))}
      </ReviewSection>

      {/* Rate & Billing */}
      <ReviewSection
        icon={<DollarSign className="h-4 w-4" />}
        title="Rate & Billing"
      >
        <ReviewRow
          label="Customer Rate"
          value={
            values.customerRate
              ? `$${values.customerRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "Not set"
          }
        />
        {values.fuelSurcharge != null && values.fuelSurcharge > 0 && (
          <ReviewRow
            label="Fuel Surcharge"
            value={`$${values.fuelSurcharge.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
        )}
        {values.accessorials.length > 0 && (
          <div className="space-y-1">
            {values.accessorials.map((acc: AccessorialValues, i: number) => (
              <ReviewRow
                key={acc.id || i}
                label={ACCESSORIAL_TYPE_LABELS[acc.type] || acc.type}
                value={`$${acc.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              />
            ))}
          </div>
        )}
        {totalCharges > 0 && (
          <>
            <Separator className="my-2" />
            <ReviewRow
              label="Total Charges"
              value={`$${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              bold
            />
          </>
        )}
        {marginDollars != null && marginPercent != null && (
          <ReviewRow
            label="Estimated Margin"
            value={
              <span
                className={cn(
                  marginPercent >= 15
                    ? "text-emerald-600"
                    : marginPercent >= 5
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                ${marginDollars.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                ({marginPercent.toFixed(1)}%)
              </span>
            }
          />
        )}
        <ReviewRow
          label="Payment Terms"
          value={PAYMENT_TERMS_LABELS[values.paymentTerms] || values.paymentTerms}
        />
        {values.billingNotes && (
          <ReviewRow label="Billing Notes" value={values.billingNotes} />
        )}
      </ReviewSection>
    </div>
  );
}

// --- Helper Components ---

function ReviewSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1">{children}</CardContent>
    </Card>
  );
}

function ReviewRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-right", bold && "font-semibold")}>
        {value}
      </span>
    </div>
  );
}
