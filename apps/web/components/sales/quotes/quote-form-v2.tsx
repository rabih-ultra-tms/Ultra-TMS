"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Send, Loader2, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/tms/layout/page-header";

import { QuoteStopsBuilder } from "./quote-stops-builder";
import { QuoteRateSection, RateSummaryCard } from "./quote-rate-section";

import {
  useCreateQuote,
  useUpdateQuote,
  useSendQuote,
} from "@/lib/hooks/sales/use-quotes";
import { useCompanies } from "@/lib/hooks/crm/use-companies";
import { useDebounce } from "@/lib/hooks/use-debounce";

import type {
  QuoteFormValues,
  QuoteDetail,
  ServiceType,
  EquipmentType,
  CalculateRateResponse,
} from "@/types/quotes";
import {
  EQUIPMENT_TYPE_FULL_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/types/quotes";

// --- Zod Schema ---

const stopSchema = z.object({
  type: z.enum(["PICKUP", "DELIVERY", "STOP"]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required").max(2),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  facilityName: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  sequence: z.number(),
});

const accessorialSchema = z.object({
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  rateType: z.enum(["FLAT", "PER_MILE", "PER_CWT", "PERCENTAGE"]),
  amount: z.number().min(0, "Amount must be positive"),
});

const quoteFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional(),
  contactId: z.string().optional(),
  serviceType: z.enum(["FTL", "LTL", "PARTIAL", "DRAYAGE"]),
  equipmentType: z.enum([
    "DRY_VAN",
    "REEFER",
    "FLATBED",
    "STEP_DECK",
    "LOWBOY",
    "CONESTOGA",
    "POWER_ONLY",
  ]),
  commodity: z.string().optional(),
  weight: z.number().optional(),
  pieces: z.number().optional(),
  pallets: z.number().optional(),
  specialHandling: z.array(z.string()).optional(),
  stops: z.array(stopSchema).min(2, "At least pickup and delivery required"),
  linehaulRate: z.number().min(0, "Rate must be positive"),
  fuelSurcharge: z.number().optional(),
  accessorials: z.array(accessorialSchema),
  internalNotes: z.string().optional(),
  validityDays: z.number().optional(),
});

// --- Equipment buttons ---

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string; short: string }[] = [
  { value: "DRY_VAN", label: "Dry Van", short: "DV" },
  { value: "REEFER", label: "Reefer", short: "RF" },
  { value: "FLATBED", label: "Flatbed", short: "FB" },
  { value: "STEP_DECK", label: "Step Deck", short: "SD" },
  { value: "LOWBOY", label: "Lowboy", short: "LB" },
  { value: "POWER_ONLY", label: "Power Only", short: "PO" },
];

// --- Props ---

interface QuoteFormV2Props {
  initialData?: QuoteDetail;
  quoteId?: string;
}

const DEFAULT_VALUES: QuoteFormValues = {
  customerId: "",
  serviceType: "FTL",
  equipmentType: "DRY_VAN",
  stops: [
    { type: "PICKUP", city: "", state: "", sequence: 1 },
    { type: "DELIVERY", city: "", state: "", sequence: 2 },
  ],
  linehaulRate: 0,
  accessorials: [],
};

function mapDetailToFormValues(detail: QuoteDetail): QuoteFormValues {
  return {
    customerId: detail.customerId,
    customerName: detail.customerName,
    contactId: undefined,
    serviceType: detail.serviceType,
    equipmentType: detail.equipmentType,
    commodity: detail.commodity,
    weight: detail.weight,
    pieces: detail.pieces,
    pallets: detail.pallets,
    specialHandling: detail.specialHandling,
    stops:
      detail.stops && detail.stops.length >= 2
        ? detail.stops.map((s) => ({
            type: s.type,
            city: s.city,
            state: s.state,
            address: s.address,
            zipCode: s.zipCode,
            facilityName: s.facilityName,
            appointmentDate: s.appointmentDate,
            appointmentTime: s.appointmentTime,
            notes: s.notes,
            sequence: s.sequence,
          }))
        : [
            {
              type: "PICKUP" as const,
              city: detail.originCity,
              state: detail.originState,
              sequence: 1,
            },
            {
              type: "DELIVERY" as const,
              city: detail.destinationCity,
              state: detail.destinationState,
              sequence: 2,
            },
          ],
    linehaulRate: detail.linehaulRate ?? 0,
    fuelSurcharge: detail.fuelSurcharge,
    accessorials: [],
    internalNotes: undefined,
    validityDays: 7,
  };
}

// --- Main Component ---

export function QuoteFormV2({ initialData, quoteId }: QuoteFormV2Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useCreateQuote();
  const updateMutation = useUpdateQuote();
  const sendMutation = useSendQuote();

  const [rateData, setRateData] = useState<CalculateRateResponse | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const debouncedSearch = useDebounce(customerSearch, 300);

  const { data: companiesData } = useCompanies({
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialData
      ? mapDetailToFormValues(initialData)
      : DEFAULT_VALUES,
    mode: "onChange",
  });

  const { isDirty, isSubmitting } = form.formState;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Warn on browser close if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Build customer options from CRM data
  const customerOptions = (companiesData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name ?? "Unknown",
    description: c.address?.city
      ? `${c.address.city}, ${c.address.state}`
      : undefined,
  }));

  // If editing, ensure current customer is in the options
  if (
    initialData?.customerId &&
    !customerOptions.some((o) => o.value === initialData.customerId)
  ) {
    customerOptions.unshift({
      value: initialData.customerId,
      label: initialData.customerName ?? "Customer",
      description: undefined,
    });
  }

  // --- Submit handlers ---

  const handleSaveDraft = async (values: QuoteFormValues) => {
    if (isEdit && quoteId) {
      const result = await updateMutation.mutateAsync({
        id: quoteId,
        data: values,
      });
      router.push(`/quotes/${quoteId}`);
    } else {
      const result = await createMutation.mutateAsync(values);
      if (result?.id) {
        router.push(`/quotes/${result.id}`);
      }
    }
  };

  const handleSaveAndSend = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();

    let savedQuoteId = quoteId;
    if (isEdit && quoteId) {
      await updateMutation.mutateAsync({ id: quoteId, data: values });
    } else {
      const result = await createMutation.mutateAsync(values);
      savedQuoteId = result?.id;
    }

    if (savedQuoteId) {
      await sendMutation.mutateAsync(savedQuoteId);
      setShowSendDialog(false);
      router.push(`/quotes/${savedQuoteId}`);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowExitDialog(true);
    } else {
      router.push(quoteId ? `/quotes/${quoteId}` : "/quotes");
    }
  };

  // --- Computed values for rate summary ---
  const linehaulRate = form.watch("linehaulRate") ?? 0;
  const fuelSurcharge = form.watch("fuelSurcharge") ?? 0;
  const watchedAccessorials = form.watch("accessorials") ?? [];
  const accessorialsTotal = watchedAccessorials.reduce(
    (sum, a) => sum + (a.amount || 0),
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

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>{isEdit ? "Edit Quote" : "New Quote"}</span>
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 p-6 md:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveDraft)}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              {/* Left: Form sections */}
              <div className="space-y-6">
                {/* Section 1: Customer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              options={customerOptions}
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                const selected = customerOptions.find(
                                  (o) => o.value === val
                                );
                                if (selected) {
                                  form.setValue("customerName", selected.label);
                                }
                              }}
                              placeholder="Search customers..."
                              searchPlaceholder="Type to search..."
                              emptyMessage="No customers found"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(
                                  Object.entries(SERVICE_TYPE_LABELS) as [
                                    ServiceType,
                                    string,
                                  ][]
                                ).map(([val, label]) => (
                                  <SelectItem key={val} value={val}>
                                    {label}
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
                        name="validityDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validity</FormLabel>
                            <Select
                              value={String(field.value ?? 7)}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="5">5 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Equipment selector */}
                    <FormField
                      control={form.control}
                      name="equipmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment Type *</FormLabel>
                          <FormControl>
                            <div className="flex flex-wrap gap-2">
                              {EQUIPMENT_OPTIONS.map((eq) => (
                                <Button
                                  key={eq.value}
                                  type="button"
                                  variant={
                                    field.value === eq.value
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className={cn(
                                    "h-10 px-4",
                                    field.value === eq.value &&
                                      "shadow-sm"
                                  )}
                                  onClick={() => field.onChange(eq.value)}
                                >
                                  <span className="font-semibold mr-1.5">
                                    {eq.short}
                                  </span>
                                  <span className="text-xs opacity-80 hidden sm:inline">
                                    {eq.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Section 2: Shipment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Shipment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="commodity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commodity</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Electronics - Consumer"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (lbs)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="42,000"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pieces"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pieces</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="24"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pallets"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pallets</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="12"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Stops */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Route & Stops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuoteStopsBuilder form={form} />
                  </CardContent>
                </Card>

                {/* Section 4: Rate & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Rate & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuoteRateSection
                      form={form}
                      rateData={rateData}
                      onRateDataChange={setRateData}
                    />
                  </CardContent>
                </Card>

                {/* Section 5: Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Internal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="internalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Internal notes (not visible to customer)..."
                              rows={3}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Sticky Rate Summary */}
              <div className="hidden lg:block">
                <div className="sticky top-6 space-y-4">
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
              </div>
            </div>

            {/* Hidden submit button */}
            <button type="submit" className="hidden" aria-label="Submit quote form" />
          </form>
        </Form>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-0">
          <Button variant="ghost" onClick={handleBack} disabled={isSaving}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={form.handleSubmit(handleSaveDraft)}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={() => setShowSendDialog(true)}
              disabled={!isDirty || isSaving}
            >
              <Send className="h-4 w-4 mr-2" />
              Save & Send
            </Button>
          </div>
        </div>
      </div>

      {/* Unsaved changes dialog */}
      <ConfirmDialog
        open={showExitDialog}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowExitDialog(false);
          router.push(quoteId ? `/quotes/${quoteId}` : "/quotes");
        }}
        onCancel={() => setShowExitDialog(false)}
      />

      {/* Send confirmation dialog */}
      <ConfirmDialog
        open={showSendDialog}
        title="Send Quote"
        description="Save this quote and send it to the customer? The quote status will change to Sent."
        confirmLabel="Save & Send"
        isLoading={sendMutation.isPending || isSaving}
        onConfirm={handleSaveAndSend}
        onCancel={() => setShowSendDialog(false)}
      />
    </div>
  );
}
