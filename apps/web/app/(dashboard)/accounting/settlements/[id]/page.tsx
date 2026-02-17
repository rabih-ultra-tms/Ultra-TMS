"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailPage, DetailTab } from "@/components/patterns/detail-page";
import { SettlementStatusBadge } from "@/components/accounting/settlement-status-badge";
import {
  useSettlement,
  useApproveSettlement,
  useProcessSettlement,
  useDeleteSettlement,
} from "@/lib/hooks/accounting/use-settlements";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  Banknote,
} from "lucide-react";

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

export default function SettlementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    data: settlement,
    isLoading,
    error,
    refetch,
  } = useSettlement(params.id);
  const approveSettlement = useApproveSettlement();
  const processSettlement = useProcessSettlement();
  const deleteSettlement = useDeleteSettlement();

  const handleApprove = async () => {
    try {
      await approveSettlement.mutateAsync(params.id);
      toast.success("Settlement approved");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to approve settlement";
      toast.error(message);
    }
  };

  const handleProcess = async () => {
    try {
      await processSettlement.mutateAsync(params.id);
      toast.success("Settlement payout processed");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process settlement";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSettlement.mutateAsync(params.id);
      toast.success("Settlement deleted");
      router.push("/accounting/settlements");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete settlement";
      toast.error(message);
    }
  };

  const canApprove = settlement?.status === "CREATED";
  const canProcess = settlement?.status === "APPROVED";
  const canDelete = settlement?.status === "CREATED";

  const actions = (
    <>
      {canApprove && (
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={approveSettlement.isPending}
        >
          <CheckCircle className="mr-2 size-4" />
          {approveSettlement.isPending ? "Approving..." : "Approve"}
        </Button>
      )}
      {canProcess && (
        <Button
          size="sm"
          onClick={handleProcess}
          disabled={processSettlement.isPending}
        >
          <Banknote className="mr-2 size-4" />
          {processSettlement.isPending ? "Processing..." : "Process Payout"}
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={deleteSettlement.isPending}
              >
                <Trash2 className="mr-2 size-4" />
                Delete Settlement
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const lineItemCount = settlement?.lineItems?.length ?? 0;

  const tabs: DetailTab[] = [
    {
      value: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      content: settlement ? (
        <SettlementOverviewTab settlement={settlement} />
      ) : null,
    },
    {
      value: "line-items",
      label: `Line Items (${lineItemCount})`,
      icon: ListChecks,
      content: settlement ? (
        <SettlementLineItemsTab settlement={settlement} />
      ) : null,
    },
  ];

  return (
    <DetailPage
      title={settlement?.settlementNumber || "Settlement Details"}
      subtitle={
        settlement?.carrierName && `Carrier: ${settlement.carrierName}`
      }
      tags={
        settlement && (
          <SettlementStatusBadge status={settlement.status} size="md" />
        )
      }
      actions={actions}
      backLink="/accounting/settlements"
      backLabel="Back to Settlements"
      breadcrumb={
        <span>
          Accounting / Settlements / {settlement?.settlementNumber || "..."}
        </span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}

// ===========================
// Overview Tab
// ===========================

function SettlementOverviewTab({
  settlement,
}: {
  settlement: NonNullable<ReturnType<typeof useSettlement>["data"]>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Settlement Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Settlement #" value={settlement.settlementNumber} />
          <InfoRow
            label="Status"
            value={<SettlementStatusBadge status={settlement.status} />}
          />
          <InfoRow label="Carrier" value={settlement.carrierName} />
          <InfoRow
            label="Line Items"
            value={`${settlement.lineItems?.length ?? 0} payables`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="Gross Amount"
            value={
              <span className="text-base font-bold">
                {formatCurrency(settlement.grossAmount)}
              </span>
            }
          />
          <InfoRow
            label="Deductions"
            value={
              <span className="text-amber-600">
                {settlement.deductions > 0
                  ? `-${formatCurrency(settlement.deductions)}`
                  : formatCurrency(0)}
              </span>
            }
          />
          <Separator />
          <InfoRow
            label="Net Payout"
            value={
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(settlement.netAmount)}
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Created" value={formatDate(settlement.createdAt)} />
          {settlement.approvedAt && (
            <InfoRow
              label="Approved"
              value={formatDate(settlement.approvedAt)}
            />
          )}
          {settlement.approvedBy && (
            <InfoRow label="Approved By" value={settlement.approvedBy} />
          )}
          {settlement.processedAt && (
            <InfoRow
              label="Processed"
              value={formatDate(settlement.processedAt)}
            />
          )}
          {settlement.paidAt && (
            <InfoRow label="Paid" value={formatDate(settlement.paidAt)} />
          )}
          <InfoRow label="Updated" value={formatDate(settlement.updatedAt)} />
        </CardContent>
      </Card>

      {settlement.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-text-muted">
              {settlement.notes}
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

function SettlementLineItemsTab({
  settlement,
}: {
  settlement: NonNullable<ReturnType<typeof useSettlement>["data"]>;
}) {
  const items = settlement.lineItems || [];

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        No line items in this settlement.
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
                  Load #
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Description
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {item.loadNumber}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {item.description}
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
                  colSpan={2}
                  className="px-4 py-3 text-right font-medium text-text-primary"
                >
                  Gross Total
                </td>
                <td className="px-4 py-3 text-right font-medium text-text-primary">
                  {formatCurrency(settlement.grossAmount)}
                </td>
              </tr>
              {settlement.deductions > 0 && (
                <tr className="bg-muted/30">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-right font-medium text-text-muted"
                  >
                    Deductions
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-amber-600">
                    -{formatCurrency(settlement.deductions)}
                  </td>
                </tr>
              )}
              <tr className="bg-muted/50">
                <td
                  colSpan={2}
                  className="px-4 py-3 text-right font-bold text-text-primary"
                >
                  Net Payout
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">
                  {formatCurrency(settlement.netAmount)}
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
