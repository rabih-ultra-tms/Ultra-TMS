"use client";

import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { PAYMENT_STATUSES } from "@/lib/design-tokens";
import type { PaymentStatus } from "@/lib/hooks/accounting/use-payments";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md" | "lg";
}

export function PaymentStatusBadge({
  status,
  size = "sm",
}: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUSES[status];
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
