"use client";

import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { PAYABLE_STATUSES } from "@/lib/design-tokens";
import type { PayableStatus } from "@/lib/hooks/accounting/use-payables";

interface PayableStatusBadgeProps {
  status: PayableStatus;
  size?: "sm" | "md" | "lg";
}

export function PayableStatusBadge({
  status,
  size = "sm",
}: PayableStatusBadgeProps) {
  const config = PAYABLE_STATUSES[status];
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
