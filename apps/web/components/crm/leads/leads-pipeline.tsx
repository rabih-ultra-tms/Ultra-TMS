import type { Lead, LeadStage } from "@/lib/types/crm";
import { LeadCard } from "./lead-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsPipelineProps {
  pipeline: Record<string, Lead[]>;
  onSelectLead?: (id: string) => void;
}

const stageOrder: LeadStage[] = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export function LeadsPipeline({ pipeline, onSelectLead }: LeadsPipelineProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {stageOrder.map((stage) => (
        <Card key={stage} className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm uppercase text-muted-foreground">
              {stage}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pipeline[stage] || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No leads</div>
            ) : (
              pipeline[stage].map((lead) => (
                <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
