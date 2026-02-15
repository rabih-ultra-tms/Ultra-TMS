"use client";

import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { QUOTE_STATUSES } from "@/lib/design-tokens";
import type { QuoteStatus } from "@/types/quotes";

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  size?: "sm" | "md" | "lg";
}

export function QuoteStatusBadge({ status, size = "sm" }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUSES[status];
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
