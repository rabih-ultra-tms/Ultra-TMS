import { Badge } from "@/components/ui/badge";
import type { LeadStage } from "@/lib/types/crm";

interface LeadStageBadgeProps {
  stage: LeadStage;
}

export function LeadStageBadge({ stage }: LeadStageBadgeProps) {
  const getVariant = () => {
    if (stage === "WON") return "default";
    if (stage === "LOST") return "destructive";
    return "outline";
  };
  
  return (
    <Badge variant={getVariant()} className="capitalize">
      {stage}
    </Badge>
  );
}
