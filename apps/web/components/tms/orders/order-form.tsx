"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Loader2, FileText, CheckCircle, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/tms/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCreateOrder, useOrderFromQuote } from "@/lib/hooks/tms/use-orders";

import { OrderCustomerStep } from "./order-customer-step";
import { OrderCargoStep } from "./order-cargo-step";
import { OrderStopsBuilder } from "./order-stops-builder";
import { OrderRateStep } from "./order-rate-step";
import { OrderReviewStep } from "./order-review-step";

import {
  orderFormSchema,
  ORDER_FORM_DEFAULTS,
  STEP_FIELDS,
  type OrderFormValues,
  type StopFormValues,
} from "./order-form-schema";

// --- Step definitions ---

const STEPS = [
  { label: "Customer & Ref", shortLabel: "Customer" },
  { label: "Cargo Details", shortLabel: "Cargo" },
  { label: "Stops", shortLabel: "Stops" },
  { label: "Rate & Billing", shortLabel: "Rate" },
  { label: "Review & Submit", shortLabel: "Review" },
] as const;

// --- Stepper Component ---

function Stepper({
  currentStep,
  completedSteps,
  onStepClick,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps.has(index);
          const isClickable = isCompleted || index < currentStep;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted || index <= currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                  isClickable && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted &&
                      !isActive &&
                      "bg-emerald-500 text-white",
                    !isActive &&
                      !isCompleted &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isActive && "text-primary",
                    isCompleted && !isActive && "text-emerald-600",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// --- Order Summary Panel ---

function OrderSummaryPanel({ values }: { values: OrderFormValues }) {
  const totalAccessorials = values.accessorials.reduce(
    (sum: number, a: { amount: number }) => sum + (a.amount || 0),
    0
  );
  const totalCharges =
    (values.customerRate || 0) +
    (values.fuelSurcharge || 0) +
    totalAccessorials;

  const pickupStop = values.stops.find((s: StopFormValues) => s.type === "PICKUP");
  const deliveryStop = values.stops
    .filter((s: StopFormValues) => s.type === "DELIVERY")
    .pop();

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <SummaryRow
          label="Customer"
          value={values.customerName || "Not selected"}
          muted={!values.customerName}
        />
        {values.poNumber && (
          <SummaryRow label="PO #" value={values.poNumber} />
        )}
        <SummaryRow
          label="Equipment"
          value={
            values.equipmentType
              ? values.equipmentType.replace(/_/g, " ")
              : "Not selected"
          }
          muted={!values.equipmentType}
        />
        {values.commodity && (
          <SummaryRow
            label="Cargo"
            value={`${values.commodity}${values.weight ? `, ${values.weight.toLocaleString()} lbs` : ""}`}
          />
        )}
        <SummaryRow
          label="Route"
          value={
            pickupStop?.city && deliveryStop?.city
              ? `${pickupStop.city}, ${pickupStop.state} → ${deliveryStop.city}, ${deliveryStop.state}`
              : "Not configured"
          }
          muted={!pickupStop?.city}
        />
        <SummaryRow
          label="Rate"
          value={
            values.customerRate
              ? `$${values.customerRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "Not entered"
          }
          muted={!values.customerRate}
        />
        {totalCharges > 0 && (
          <div className="pt-2 border-t border-border">
            <SummaryRow
              label="Total"
              value={`$${totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              bold
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "text-right truncate",
          muted && "text-muted-foreground italic",
          bold && "font-semibold"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// --- Main Form Component ---

export function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId") || "";

  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set()
  );
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const createOrder = useCreateOrder();
  const { data: quoteData } = useOrderFromQuote(quoteId);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema) as any,
    defaultValues: ORDER_FORM_DEFAULTS,
    mode: "onTouched",
  });

  const { isDirty } = form.formState;
  const watchedValues = form.watch();

  // Pre-fill from quote when data loads
  React.useEffect(() => {
    if (quoteData && quoteId) {
      const q = quoteData as any;
      const prefill: Partial<OrderFormValues> = {};

      if (q.customerId) prefill.customerId = q.customerId;
      if (q.customer?.companyName) prefill.customerName = q.customer.companyName;
      if (q.commodity) prefill.commodity = q.commodity;
      if (q.weightLbs) prefill.weight = q.weightLbs;
      if (q.pieceCount) prefill.pieces = q.pieceCount;
      if (q.palletCount) prefill.pallets = q.palletCount;
      if (q.equipmentType) prefill.equipmentType = q.equipmentType;
      if (q.customerRate) prefill.customerRate = q.customerRate;
      if (q.fuelSurcharge) prefill.fuelSurcharge = q.fuelSurcharge;

      if (q.stops?.length) {
        prefill.stops = q.stops.map(
          (s: any, i: number): StopFormValues => ({
            id: crypto.randomUUID(),
            type: s.stopType || s.type || "PICKUP",
            facilityName: s.facilityName || "",
            address: s.addressLine1 || s.address || "",
            city: s.city || "",
            state: s.state || "",
            zipCode: s.postalCode || s.zipCode || "",
            contactName: s.contactName || "",
            contactPhone: s.contactPhone || "",
            appointmentDate: s.appointmentDate || "",
            appointmentTimeFrom: s.appointmentTimeStart || s.appointmentTime || "",
            appointmentTimeTo: s.appointmentTimeEnd || "",
            weight: null,
            pieces: null,
            pallets: null,
            commodity: "",
            instructions: s.specialInstructions || "",
            referenceNumber: "",
            sequence: i,
          })
        );
      }

      form.reset({ ...ORDER_FORM_DEFAULTS, ...prefill });
    }
  }, [quoteData, quoteId, form]);

  // Warn on browser close with unsaved changes
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // --- Step Navigation ---

  const validateCurrentStep = async (): Promise<boolean> => {
    const fields = STEP_FIELDS[currentStep];
    if (!fields || fields.length === 0) return true;

    const result = await form.trigger(fields as any);
    return result;
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) {
      toast.error("Please fix the errors before continuing.");
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    goToStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      goToStep(step);
    }
  };

  // --- Submit ---

  const handleSubmit = async (status: "PENDING" | "BOOKED") => {
    // Validate all steps before submitting
    const isValid = await form.trigger();
    if (!isValid && status === "BOOKED") {
      toast.error("Please complete all required fields before confirming.");
      return;
    }

    try {
      const formData = form.getValues();
      const result = await createOrder.mutateAsync({
        formData,
        status,
      });

      const orderId = (result as any)?.data?.id || (result as any)?.id;
      toast.success(
        status === "BOOKED" ? "Order created and confirmed!" : "Draft saved!"
      );

      if (orderId) {
        router.push(`/operations/orders/${orderId}`);
      } else {
        router.push("/operations/orders");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create order. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowExitDialog(true);
    } else {
      router.push("/operations/orders");
    }
  };

  // --- Render Steps ---

  const renderStep = () => {
    // Cast to any to avoid Zod v4 + react-hook-form type inference mismatch
    const f = form as any;
    switch (currentStep) {
      case 0:
        return <OrderCustomerStep form={f} />;
      case 1:
        return <OrderCargoStep form={f} />;
      case 2:
        return <OrderStopsBuilder form={f} />;
      case 3:
        return <OrderRateStep form={f} />;
      case 4:
        return <OrderReviewStep form={f} values={watchedValues} />;
      default:
        return null;
    }
  };

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
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <span>New Order</span>
              {quoteId && (
                <span className="text-xs font-normal text-muted-foreground">
                  From Quote
                </span>
              )}
            </div>
          </div>
        }
      />

      {/* Stepper */}
      <div className="border-b border-border">
        <Stepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {/* Main Form */}
          <div className="flex-1 min-w-0">
            <Form {...form}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {renderStep()}
              </form>
            </Form>
          </div>

          {/* Right Summary Panel (desktop) */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-6">
              <OrderSummaryPanel values={watchedValues} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Left: Cancel */}
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>

          {/* Center: Save Draft */}
          <Button
            variant="outline"
            onClick={() => handleSubmit("PENDING")}
            disabled={createOrder.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          {/* Right: Back / Next / Submit */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("PENDING")}
                  disabled={createOrder.isPending}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create as Draft
                </Button>
                <Button
                  onClick={() => handleSubmit("BOOKED")}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Create &amp; Confirm
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation */}
      <ConfirmDialog
        open={showExitDialog}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowExitDialog(false);
          router.push("/operations/orders");
        }}
        onCancel={() => setShowExitDialog(false)}
      />
    </div>
  );
}
