import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types/crm";
import { LeadStageBadge } from "./lead-stage-badge";

interface LeadCardProps {
  lead: Lead;
  onSelect?: (id: string) => void;
  isDragging?: boolean;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragActive(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ id: lead.id, currentStage: lead.stage }));
  };

  const handleDragEnd = () => {
    setIsDragActive(false);
  };

  return (
    <Card
      draggable
      className={`cursor-move transition-all border-l-4 border-l-primary hover:shadow-md ${isDragActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onClick={() => onSelect?.(lead.id)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
        {lead.estimatedValue && typeof lead.estimatedValue === "number" ? (
          <div className="flex items-center justify-between">
            <span>Est. value</span>
            <span className="font-medium">${Number(lead.estimatedValue).toLocaleString()}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
