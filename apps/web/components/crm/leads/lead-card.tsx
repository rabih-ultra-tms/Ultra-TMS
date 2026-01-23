import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types/crm";
import { LeadStageBadge } from "./lead-stage-badge";

interface LeadCardProps {
  lead: Lead;
  onSelect?: (id: string) => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onSelect?.(lead.id)}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">{lead.name}</CardTitle>
        <LeadStageBadge stage={lead.stage} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="text-muted-foreground">{lead.company?.name || "No company"}</div>
        <div className="flex items-center justify-between">
          <span>Probability</span>
          <span className="font-medium">{(lead.probability ?? 0)}%</span>
        </div>
        {lead.estimatedValue ? (
          <div className="flex items-center justify-between">
            <span>Est. value</span>
            <span className="font-medium">${lead.estimatedValue.toLocaleString()}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
