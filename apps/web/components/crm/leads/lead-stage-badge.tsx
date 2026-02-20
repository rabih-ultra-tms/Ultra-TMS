import { UnifiedStatusBadge } from "@/components/shared/status-badge";
import type { LeadStage } from "@/lib/types/crm";

interface LeadStageBadgeProps {
  stage: LeadStage;
  size?: "sm" | "md" | "lg";
}

export function LeadStageBadge({ stage, size = "sm" }: LeadStageBadgeProps) {
  return <UnifiedStatusBadge entity="lead" status={stage} size={size} withDot />;
}
