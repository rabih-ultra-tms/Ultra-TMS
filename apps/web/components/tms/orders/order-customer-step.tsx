"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { AlertCircle, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SearchableSelect } from "@/components/ui/searchable-select";

import { useCompanies } from "@/lib/hooks/crm/use-companies";
import type { Customer } from "@/lib/types/crm";

import { PRIORITIES, type OrderFormValues } from "./order-form-schema";

/** Extended Customer with optional fields that may come from the API response */
interface CompanyRecord extends Customer {
  companyName?: string;
  currentBalance?: number;
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

interface OrderCustomerStepProps {
  form: UseFormReturn<OrderFormValues>;
  isCustomerLocked?: boolean;
}

export function OrderCustomerStep({ form, isCustomerLocked = false }: OrderCustomerStepProps) {
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies({
    limit: 50,
  });

  const customerOptions = useMemo(() => {
    const companies = companiesData?.data || [];
    return companies.map((c: CompanyRecord) => ({
      value: c.id,
      label: c.name || c.legalName || "Unknown",
      description: [c.address?.city, c.address?.state].filter(Boolean).join(", ") || undefined,
    }));
  }, [companiesData]);

  const selectedCustomerId = form.watch("customerId");
  const selectedCustomer = useMemo(() => {
    const companies = companiesData?.data || [];
    return companies.find((c: CompanyRecord) => c.id === selectedCustomerId);
  }, [companiesData, selectedCustomerId]) as CompanyRecord | undefined;

  // Credit status warning
  const creditBlocked =
    selectedCustomer?.status === "SUSPENDED" ||
    selectedCustomer?.status === "INACTIVE";

  const creditWarning =
    selectedCustomer?.creditLimit &&
    selectedCustomer?.currentBalance &&
    selectedCustomer.currentBalance >= selectedCustomer.creditLimit;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Customer & Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selector */}
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
                    onChange={(value) => {
                      field.onChange(value);
                      const customer = (companiesData?.data || []).find(
                        (c: CompanyRecord) => c.id === value
                      ) as CompanyRecord | undefined;
                      if (customer) {
                        form.setValue(
                          "customerName",
                          customer.name || customer.companyName || ""
                        );
                        if (customer.paymentTerms) {
                          form.setValue("paymentTerms", customer.paymentTerms);
                        }
                      }
                    }}
                    placeholder="Search customers..."
                    searchPlaceholder="Type to search by name..."
                    emptyMessage={
                      loadingCompanies
                        ? "Loading..."
                        : "No customers found"
                    }
                    disabled={!!isCustomerLocked}
                  />
                </FormControl>
                {isCustomerLocked && (
                  <p className="text-xs text-muted-foreground">
                    Customer cannot be changed after order is booked
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer info card */}
          {selectedCustomer && (
            <div className="rounded-md border border-border bg-muted/30 p-3 flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 text-sm">
                <div className="font-medium">
                  {selectedCustomer.name || selectedCustomer.companyName}
                </div>
                {selectedCustomer.address && (
                  <div className="text-muted-foreground">
                    {[
                      selectedCustomer.address.city,
                      selectedCustomer.address.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      selectedCustomer.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {selectedCustomer.status || "Active"}
                  </Badge>
                  {selectedCustomer.creditLimit && (
                    <span className="text-xs text-muted-foreground">
                      Credit: $
                      {selectedCustomer.creditLimit.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Credit blocked warning */}
          {creditBlocked && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This customer&apos;s account is on{" "}
                <strong>{selectedCustomer.status}</strong> status. Orders
                cannot be confirmed until the account is activated.
              </AlertDescription>
            </Alert>
          )}

          {/* Credit limit warning */}
          {creditWarning && !creditBlocked && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This customer is at or over their credit limit ($
                {selectedCustomer?.creditLimit?.toLocaleString()}). The order
                can be saved as draft but may require approval to confirm.
              </AlertDescription>
            </Alert>
          )}

          {/* Reference Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerReferenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Reference #</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., REF-12345"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., PO-2025-001"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bolNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BOL Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., BOL-001"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Internal Notes */}
          <FormField
            control={form.control}
            name="internalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Internal notes (not visible to customer)..."
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
