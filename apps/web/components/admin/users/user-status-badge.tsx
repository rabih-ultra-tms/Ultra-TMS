import { UnifiedStatusBadge } from "@/components/shared/status-badge";
import type { UserStatus } from "@/lib/types/auth";

interface UserStatusBadgeProps {
  status: UserStatus;
  size?: "sm" | "md" | "lg";
}

export function UserStatusBadge({ status, size = "sm" }: UserStatusBadgeProps) {
  return <UnifiedStatusBadge entity="user" status={status} size={size} withDot />;
}
