"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormPage, FormSection } from "@/components/patterns/form-page";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateInvoice } from "@/lib/hooks/accounting/use-invoices";

// ===========================
// Schema
// ===========================

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
  loadId: z.string().optional(),
});

const invoiceFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderId: z.string().optional(),
  loadId: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  notes: z.string().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const DEFAULT_VALUES: InvoiceFormValues = {
  customerId: "",
  orderId: "",
  loadId: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  paymentTerms: "NET30",
  notes: "",
  lineItems: [{ description: "", quantity: 1, unitPrice: 0, loadId: "" }],
};

const PAYMENT_TERMS = [
  { value: "COD", label: "COD (Cash on Delivery)" },
  { value: "NET15", label: "NET 15" },
  { value: "NET21", label: "NET 21" },
  { value: "NET30", label: "NET 30" },
  { value: "NET45", label: "NET 45" },
];

// ===========================
// Component
// ===========================

export function InvoiceForm() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      const payload = {
        ...values,
        lineItems: values.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          loadId: item.loadId || undefined,
        })),
      };
      const result = await createInvoice.mutateAsync(payload);
      toast.success("Invoice created successfully");
      router.push(`/accounting/invoices/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create invoice";
      toast.error(message);
    }
  };

  return (
    <FormPage
      title="New Invoice"
      description="Create a customer invoice for delivered loads."
      backPath="/accounting/invoices"
      schema={invoiceFormSchema}
      defaultValues={DEFAULT_VALUES}
      onSubmit={handleSubmit}
      isSubmitting={createInvoice.isPending}
      submitLabel="Create Invoice"
    >
      {(form) => (
        <>
          <InvoiceDetailsSection form={form} />
          <LineItemsSection form={form} />
          <NotesSection form={form} />
        </>
      )}
    </FormPage>
  );
}

// ===========================
// Form Sections
// ===========================

function InvoiceDetailsSection({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  return (
    <FormSection
      title="Invoice Details"
      description="Customer and billing information."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoiceDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
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
          name="orderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Link to order" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loadId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Load ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Link to load" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}

function LineItemsSection({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  const lineItems = form.watch("lineItems");

  const addLineItem = () => {
    const current = form.getValues("lineItems");
    form.setValue("lineItems", [
      ...current,
      { description: "", quantity: 1, unitPrice: 0, loadId: "" },
    ]);
  };

  const removeLineItem = (index: number) => {
    const current = form.getValues("lineItems");
    if (current.length <= 1) return;
    form.setValue(
      "lineItems",
      current.filter((_, i) => i !== index)
    );
  };

  const total = lineItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  return (
    <FormSection
      title="Line Items"
      description="Add charges for this invoice."
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="hidden gap-4 text-xs font-medium text-text-muted sm:grid sm:grid-cols-[1fr_80px_120px_80px_40px]">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit Price</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {/* Rows */}
        {lineItems.map((item, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_80px_120px_80px_40px] sm:items-start sm:gap-4 sm:border-0 sm:p-0"
          >
            <FormField
              control={form.control}
              name={`lineItems.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sm:sr-only">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`lineItems.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sm:sr-only">Qty</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`lineItems.${index}.unitPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sm:sr-only">Unit Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end pt-2 text-sm font-medium text-text-primary sm:pt-2">
              $
              {(
                (item.quantity || 0) * (item.unitPrice || 0)
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="flex items-start justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length <= 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add button + Total */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
          >
            <Plus className="mr-2 size-4" />
            Add Line Item
          </Button>
          <div className="text-right">
            <span className="text-sm text-text-muted">Total: </span>
            <span className="text-lg font-bold text-text-primary">
              $
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function NotesSection({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  return (
    <FormSection title="Notes" description="Optional notes for this invoice.">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Add any notes or special instructions..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
