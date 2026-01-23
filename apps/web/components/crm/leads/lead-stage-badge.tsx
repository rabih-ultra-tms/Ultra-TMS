import { Badge } from "@/components/ui/badge";
import type { LeadStage } from "@/lib/types/crm";
import { cn } from "@/lib/utils";

const stageStyles: Record<LeadStage, string> = {
  LEAD: "bg-slate-100 text-slate-700 border-slate-200",
  QUALIFIED: "bg-blue-100 text-blue-700 border-blue-200",
  PROPOSAL: "bg-indigo-100 text-indigo-700 border-indigo-200",
  NEGOTIATION: "bg-amber-100 text-amber-700 border-amber-200",
  WON: "bg-green-100 text-green-700 border-green-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
};

interface LeadStageBadgeProps {
  stage: LeadStage;
}

export function LeadStageBadge({ stage }: LeadStageBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", stageStyles[stage])}>
      {stage}
    </Badge>
  );
}
