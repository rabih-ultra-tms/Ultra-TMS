"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/accounting/invoice-status-badge";
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

// ===========================
// Overview Tab
// ===========================

export function InvoiceOverviewTab({ invoice }: { invoice: Invoice }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Invoice Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Invoice #" value={invoice.invoiceNumber} />
          <InfoRow
            label="Status"
            value={<InvoiceStatusBadge status={invoice.status} />}
          />
          <InfoRow label="Invoice Date" value={formatDate(invoice.invoiceDate)} />
          <InfoRow label="Due Date" value={formatDate(invoice.dueDate)} />
          <InfoRow label="Payment Terms" value={invoice.paymentTerms} />
          {invoice.orderNumber && (
            <InfoRow label="Order #" value={invoice.orderNumber} />
          )}
          {invoice.loadNumber && (
            <InfoRow label="Load #" value={invoice.loadNumber} />
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
          <InfoRow label="Tax" value={formatCurrency(invoice.taxAmount)} />
          <Separator />
          <InfoRow
            label="Total"
            value={
              <span className="text-base font-bold">
                {formatCurrency(invoice.totalAmount)}
              </span>
            }
          />
          <InfoRow
            label="Amount Paid"
            value={
              <span className="text-emerald-600">
                {formatCurrency(invoice.amountPaid)}
              </span>
            }
          />
          <Separator />
          <InfoRow
            label="Balance Due"
            value={
              <span
                className={`text-base font-bold ${
                  invoice.balanceDue > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(invoice.balanceDue)}
              </span>
            }
          />
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Customer" value={invoice.customerName} />
          <InfoRow label="Customer ID" value={invoice.customerId} />
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Created" value={formatDate(invoice.createdAt)} />
          <InfoRow label="Updated" value={formatDate(invoice.updatedAt)} />
          {invoice.sentAt && (
            <InfoRow label="Sent" value={formatDate(invoice.sentAt)} />
          )}
          {invoice.viewedAt && (
            <InfoRow label="Viewed" value={formatDate(invoice.viewedAt)} />
          )}
          {invoice.paidAt && (
            <InfoRow label="Paid" value={formatDate(invoice.paidAt)} />
          )}
          {invoice.voidedAt && (
            <>
              <InfoRow label="Voided" value={formatDate(invoice.voidedAt)} />
              {invoice.voidReason && (
                <InfoRow label="Void Reason" value={invoice.voidReason} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-text-muted">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===========================
// Line Items Tab
// ===========================

export function InvoiceLineItemsTab({ invoice }: { invoice: Invoice }) {
  const items = invoice.lineItems || [];

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        No line items on this invoice.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Load #
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-text-primary">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {item.loadNumber || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right font-medium text-text-primary"
                >
                  Subtotal
                </td>
                <td className="px-4 py-3 text-right font-medium text-text-primary">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              {invoice.taxAmount > 0 && (
                <tr className="bg-muted/30">
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right font-medium text-text-muted"
                  >
                    Tax
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-muted">
                    {formatCurrency(invoice.taxAmount)}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-border bg-muted/50">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-base font-bold text-text-primary"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-right text-base font-bold text-text-primary">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================
// Payments Tab
// ===========================

export function InvoicePaymentsTab({ invoice }: { invoice: Invoice }) {
  const payments = invoice.payments || [];

  if (payments.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        No payments recorded for this invoice.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Payment #
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Method
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {payment.paymentNumber}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {payment.method}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-medium text-text-primary"
                >
                  Total Paid
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  {formatCurrency(invoice.amountPaid)}
                </td>
              </tr>
              <tr className="bg-muted/50">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-bold text-text-primary"
                >
                  Balance Due
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${
                    invoice.balanceDue > 0
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(invoice.balanceDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================
// Shared helpers
// ===========================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
