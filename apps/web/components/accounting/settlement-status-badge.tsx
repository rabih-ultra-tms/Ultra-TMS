"use client";

import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { SETTLEMENT_STATUSES } from "@/lib/design-tokens";
import type { SettlementStatus } from "@/lib/hooks/accounting/use-settlements";

interface SettlementStatusBadgeProps {
  status: SettlementStatus;
  size?: "sm" | "md" | "lg";
}

export function SettlementStatusBadge({
  status,
  size = "sm",
}: SettlementStatusBadgeProps) {
  const config = SETTLEMENT_STATUSES[status];
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
