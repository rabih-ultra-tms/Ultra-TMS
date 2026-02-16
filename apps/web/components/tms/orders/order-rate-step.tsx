"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  ACCESSORIAL_TYPES,
  ACCESSORIAL_TYPE_LABELS,
  type OrderFormValues,
} from "./order-form-schema";

interface OrderRateStepProps {
  form: UseFormReturn<OrderFormValues>;
}

export function OrderRateStep({ form }: OrderRateStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "accessorials",
  });

  const customerRate = form.watch("customerRate") || 0;
  const fuelSurcharge = form.watch("fuelSurcharge") || 0;
  const estimatedCarrierRate = form.watch("estimatedCarrierRate") || 0;
  const accessorials = form.watch("accessorials") || [];

  const totalAccessorials = accessorials.reduce(
    (sum: number, a: { amount: number }) => sum + (a.amount || 0),
    0
  );
  const totalCharges = customerRate + fuelSurcharge + totalAccessorials;

  // Margin calculation
  const marginDollars =
    customerRate && estimatedCarrierRate
      ? customerRate - estimatedCarrierRate
      : null;
  const marginPercent =
    customerRate && estimatedCarrierRate && customerRate > 0
      ? ((customerRate - estimatedCarrierRate) / customerRate) * 100
      : null;

  const marginColor =
    marginPercent != null
      ? marginPercent >= 15
        ? "text-emerald-600"
        : marginPercent >= 5
          ? "text-amber-600"
          : "text-red-600"
      : "";

  const showMarginWarning =
    marginPercent != null && marginPercent < 15;

  const addAccessorial = () => {
    append({
      id: crypto.randomUUID(),
      type: "",
      amount: 0,
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Rate & Billing
          </CardTitle>
          <CardDescription>
            Customer rate is optional for drafts, required for confirmed orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Rate ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) : null);
                        }}
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
                  <FormLabel>Fuel Surcharge ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) : null);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Total Charges */}
          {totalCharges > 0 && (
            <div className="rounded-md bg-muted/50 p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Total Customer Charges
              </span>
              <span className="text-lg font-semibold">
                ${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessorial Charges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Accessorial Charges
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAccessorial}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Accessorial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`accessorials.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ACCESSORIAL_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {ACCESSORIAL_TYPE_LABELS[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`accessorials.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="0.00"
                                className="h-8 text-sm pl-7"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : 0
                                  );
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`accessorials.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Notes"
                              className="h-8 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {totalAccessorials > 0 && (
                <div className="text-sm text-right text-muted-foreground">
                  Accessorials total: $
                  {totalAccessorials.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No accessorial charges. Click &quot;Add Accessorial&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Margin Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Margin Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="estimatedCarrierRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Carrier Rate ($)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {marginDollars != null && marginPercent != null && (
            <div className="rounded-md bg-muted/50 p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Estimated Margin
              </span>
              <div className={cn("text-right", marginColor)}>
                <span className="text-lg font-semibold">
                  ${marginDollars.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm ml-2">
                  ({marginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {showMarginWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Margin is below the 15% minimum target. Consider adjusting the
                customer rate or carrier rate.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Payment & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {PAYMENT_TERMS_LABELS[term]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="billingNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Special invoicing instructions..."
                    maxLength={500}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
