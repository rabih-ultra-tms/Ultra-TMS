"use client";

import { StatusBadge as PrimitiveStatusBadge } from "@/components/tms/primitives/status-badge";
import {
  CARRIER_STATUSES,
  DOCUMENT_STATUSES,
  INSURANCE_STATUSES,
  INVOICE_STATUSES,
  LOAD_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYABLE_STATUSES,
  PRIORITIES,
  QUOTE_STATUSES,
  SETTLEMENT_STATUSES,
} from "@/lib/design-tokens";
import type { StatusColorToken, Intent } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Unified StatusBadge — Entity-aware status badge using design tokens
//
// Accepts an entity type + status string and resolves the correct color
// from the centralized design token system. Wraps the TMS Primitives
// StatusBadge internally.
//
// Usage:
//   <UnifiedStatusBadge entity="carrier" status="active" />
//   <UnifiedStatusBadge entity="order" status="pending" size="lg" />
// ---------------------------------------------------------------------------

/** All entities supported by the unified status badge */
export type StatusEntity =
  | "user"
  | "customer"
  | "lead"
  | "order"
  | "load"
  | "carrier"
  | "document"
  | "insurance"
  | "quote"
  | "invoice"
  | "payment"
  | "payable"
  | "settlement"
  | "priority";

export interface UnifiedStatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Entity type — determines which color mapping to use */
  entity: StatusEntity;
  /** Status value (must be a valid key for the entity's status map) */
  status: string;
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Show colored dot before the label */
  withDot?: boolean;
}

// ---------------------------------------------------------------------------
// User status → design token mapping
// ---------------------------------------------------------------------------
const USER_STATUS_MAP: Record<string, { label: string; color?: StatusColorToken; intent?: Intent }> = {
  ACTIVE: { label: "Active", color: "delivered" },
  INACTIVE: { label: "Inactive", color: "unassigned" },
  PENDING: { label: "Pending", color: "tendered" },
  SUSPENDED: { label: "Suspended", color: "atrisk" },
  LOCKED: { label: "Locked", color: "atrisk" },
  INVITED: { label: "Invited", color: "dispatched" },
};

// ---------------------------------------------------------------------------
// Customer status → design token mapping
// ---------------------------------------------------------------------------
const CUSTOMER_STATUS_MAP: Record<string, { label: string; color?: StatusColorToken; intent?: Intent }> = {
  ACTIVE: { label: "Active", color: "delivered" },
  INACTIVE: { label: "Inactive", color: "unassigned" },
  PROSPECT: { label: "Prospect", color: "tendered" },
  SUSPENDED: { label: "Suspended", color: "atrisk" },
};

// ---------------------------------------------------------------------------
// Lead stage → design token mapping
// ---------------------------------------------------------------------------
const LEAD_STAGE_MAP: Record<string, { label: string; color?: StatusColorToken; intent?: Intent }> = {
  LEAD: { label: "Lead", color: "unassigned" },
  QUALIFIED: { label: "Qualified", color: "tendered" },
  PROPOSAL: { label: "Proposal", color: "dispatched" },
  NEGOTIATION: { label: "Negotiation", color: "transit" },
  WON: { label: "Won", color: "delivered" },
  LOST: { label: "Lost", color: "atrisk" },
};

/**
 * Resolve an entity + status string to a StatusColorToken (or Intent) + label.
 * For entities already in design-tokens (load, order, carrier, etc.) we read
 * directly from the constants. For entities added here (user, customer, lead)
 * we use the local maps above.
 */
function resolveStatus(entity: StatusEntity, status: string): {
  label: string;
  color?: StatusColorToken;
  intent?: Intent;
  className?: string;
} {
  const key = status.toLowerCase();
  const keyUpper = status.toUpperCase();

  switch (entity) {
    case "user":
      return USER_STATUS_MAP[keyUpper] ?? { label: status };
    case "customer":
      return CUSTOMER_STATUS_MAP[keyUpper] ?? { label: status };
    case "lead":
      return LEAD_STAGE_MAP[keyUpper] ?? { label: status };
    case "load": {
      const entry = LOAD_STATUSES[key as keyof typeof LOAD_STATUSES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "order": {
      const entry = ORDER_STATUSES[key as keyof typeof ORDER_STATUSES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "carrier": {
      const entry = CARRIER_STATUSES[key as keyof typeof CARRIER_STATUSES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "document": {
      const entry = DOCUMENT_STATUSES[key as keyof typeof DOCUMENT_STATUSES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "insurance": {
      const entry = INSURANCE_STATUSES[key as keyof typeof INSURANCE_STATUSES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "priority": {
      const entry = PRIORITIES[key as keyof typeof PRIORITIES];
      return entry
        ? { label: entry.label, color: entry.color as StatusColorToken }
        : { label: status };
    }
    case "quote": {
      const entry = QUOTE_STATUSES[keyUpper as keyof typeof QUOTE_STATUSES];
      return entry
        ? { label: entry.label, color: entry.status ?? undefined, intent: entry.intent ?? undefined, className: entry.className ?? undefined }
        : { label: status };
    }
    case "invoice": {
      const entry = INVOICE_STATUSES[keyUpper as keyof typeof INVOICE_STATUSES];
      return entry
        ? { label: entry.label, color: entry.status ?? undefined, intent: entry.intent ?? undefined, className: entry.className ?? undefined }
        : { label: status };
    }
    case "payment": {
      const entry = PAYMENT_STATUSES[keyUpper as keyof typeof PAYMENT_STATUSES];
      return entry
        ? { label: entry.label, color: entry.status ?? undefined, intent: entry.intent ?? undefined, className: entry.className ?? undefined }
        : { label: status };
    }
    case "payable": {
      const entry = PAYABLE_STATUSES[keyUpper as keyof typeof PAYABLE_STATUSES];
      return entry
        ? { label: entry.label, color: entry.status ?? undefined, intent: entry.intent ?? undefined, className: entry.className ?? undefined }
        : { label: status };
    }
    case "settlement": {
      const entry = SETTLEMENT_STATUSES[keyUpper as keyof typeof SETTLEMENT_STATUSES];
      return entry
        ? { label: entry.label, color: entry.status ?? undefined, intent: entry.intent ?? undefined, className: entry.className ?? undefined }
        : { label: status };
    }
    default:
      return { label: status };
  }
}

export function UnifiedStatusBadge({
  entity,
  status,
  size = "sm",
  withDot = false,
  className,
  ...props
}: UnifiedStatusBadgeProps) {
  const resolved = resolveStatus(entity, status);

  return (
    <PrimitiveStatusBadge
      status={resolved.color}
      intent={resolved.intent}
      size={size}
      withDot={withDot}
      className={resolved.className ? `${resolved.className} ${className ?? ""}`.trim() : className}
      {...props}
    >
      {resolved.label}
    </PrimitiveStatusBadge>
  );
}
