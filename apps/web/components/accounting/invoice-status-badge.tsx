"use client";

import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { INVOICE_STATUSES } from "@/lib/design-tokens";
import type { InvoiceStatus } from "@/lib/hooks/accounting/use-invoices";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md" | "lg";
}

export function InvoiceStatusBadge({
  status,
  size = "sm",
}: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUSES[status];
  if (!config) return null;

  return (
    <StatusBadge
      status={config.status ?? undefined}
      intent={config.intent ?? undefined}
      size={size}
      withDot
      className={config.className ?? undefined}
    >
      {config.label}
    </StatusBadge>
  );
}
