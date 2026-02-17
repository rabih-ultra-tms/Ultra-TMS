"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceStatusBadge } from "@/components/accounting/invoice-status-badge";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/lib/hooks/accounting/use-invoices";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface AllocationEntry {
  invoiceId: string;
  amount: number;
}

interface PaymentAllocationProps {
  invoices: Invoice[];
  totalPayment: number;
  allocations: AllocationEntry[];
  onAllocationsChange: (allocations: AllocationEntry[]) => void;
  isLoading?: boolean;
}

export function PaymentAllocation({
  invoices,
  totalPayment,
  allocations,
  onAllocationsChange,
  isLoading,
}: PaymentAllocationProps) {
  const openInvoices = invoices.filter(
    (inv) =>
      inv.balanceDue > 0 &&
      inv.status !== "VOID" &&
      inv.status !== "PAID"
  );

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const remaining = totalPayment - totalAllocated;

  const isSelected = (invoiceId: string) =>
    allocations.some((a) => a.invoiceId === invoiceId);

  const getAllocation = (invoiceId: string) =>
    allocations.find((a) => a.invoiceId === invoiceId)?.amount ?? 0;

  const toggleInvoice = (invoice: Invoice) => {
    if (isSelected(invoice.id)) {
      onAllocationsChange(allocations.filter((a) => a.invoiceId !== invoice.id));
    } else {
      const autoAmount = Math.min(invoice.balanceDue, Math.max(remaining, 0));
      onAllocationsChange([
        ...allocations,
        { invoiceId: invoice.id, amount: autoAmount },
      ]);
    }
  };

  const updateAmount = (invoiceId: string, amount: number) => {
    const invoice = openInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return;
    const clamped = Math.min(Math.max(0, amount), invoice.balanceDue);
    onAllocationsChange(
      allocations.map((a) =>
        a.invoiceId === invoiceId ? { ...a, amount: clamped } : a
      )
    );
  };

  const autoAllocate = () => {
    let budget = totalPayment;
    const newAllocations: AllocationEntry[] = [];
    for (const inv of openInvoices) {
      if (budget <= 0) break;
      const amount = Math.min(inv.balanceDue, budget);
      newAllocations.push({ invoiceId: inv.id, amount });
      budget -= amount;
    }
    onAllocationsChange(newAllocations);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-text-muted">
          Loading invoices...
        </CardContent>
      </Card>
    );
  }

  if (openInvoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-text-muted">
          No open invoices found for this customer.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Allocate to Invoices
          </CardTitle>
          <Button variant="outline" size="sm" onClick={autoAllocate}>
            Auto-Allocate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Invoice #
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Due Date
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Balance
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Apply
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {openInvoices.map((invoice) => {
                const selected = isSelected(invoice.id);
                const alloc = getAllocation(invoice.id);
                return (
                  <tr
                    key={invoice.id}
                    className={selected ? "bg-blue-50/50" : ""}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleInvoice(invoice)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">
                      {formatCurrency(invoice.balanceDue)}
                    </td>
                    <td className="px-4 py-3">
                      {selected ? (
                        <Input
                          type="number"
                          min={0}
                          max={invoice.balanceDue}
                          step={0.01}
                          value={alloc}
                          onChange={(e) =>
                            updateAmount(invoice.id, parseFloat(e.target.value) || 0)
                          }
                          className="h-8 w-28 text-right ml-auto"
                        />
                      ) : (
                        <div className="text-right text-text-muted">—</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Separator />
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <div className="space-y-1">
            <div className="text-sm text-text-muted">
              Payment Amount:{" "}
              <span className="font-medium text-text-primary">
                {formatCurrency(totalPayment)}
              </span>
            </div>
            <div className="text-sm text-text-muted">
              Total Allocated:{" "}
              <span className="font-medium text-emerald-600">
                {formatCurrency(totalAllocated)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-muted">Remaining</div>
            <div
              className={`text-lg font-bold ${
                remaining > 0
                  ? "text-amber-600"
                  : remaining < 0
                    ? "text-red-600"
                    : "text-emerald-600"
              }`}
            >
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
