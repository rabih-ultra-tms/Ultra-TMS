import { UnifiedStatusBadge } from "@/components/shared/status-badge";
import type { CustomerStatus } from "@/lib/types/crm";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  size?: "sm" | "md" | "lg";
}

export function CustomerStatusBadge({ status, size = "sm" }: CustomerStatusBadgeProps) {
  return <UnifiedStatusBadge entity="customer" status={status} size={size} withDot />;
}
