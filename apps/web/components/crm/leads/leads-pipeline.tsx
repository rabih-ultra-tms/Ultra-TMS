"use client";

import * as React from "react";
import type { Lead, LeadStage } from "@/lib/types/crm";
import { LeadCard } from "./lead-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useUpdateLeadStage } from "@/lib/hooks/crm/use-leads";
import { toast } from "sonner";

interface LeadsPipelineProps {
  pipeline: Record<string, Lead[]>;
  onSelectLead?: (id: string) => void;
}

const stageOrder: LeadStage[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export function LeadsPipeline({ pipeline, onSelectLead }: LeadsPipelineProps) {
  const updateLeadStageMutation = useUpdateLeadStage();
  const [draggedOverStage, setDraggedOverStage] = React.useState<string | null>(null);
  const [isDraggingCard, setIsDraggingCard] = React.useState(false);
  const [pendingMove, setPendingMove] = React.useState<{
    id: string;
    leadName: string;
    fromStage: string;
    toStage: LeadStage;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingCard(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: LeadStage) => {
    e.preventDefault();
    setDraggedOverStage(null);
    setIsDraggingCard(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;

      const { id, currentStage } = JSON.parse(data);

      if (currentStage !== targetStage) {
        const allLeads = Object.values(pipeline).flat();
        const lead = allLeads.find((l) => l.id === id);
        setPendingMove({
          id,
          leadName: lead?.name || "this deal",
          fromStage: currentStage,
          toStage: targetStage,
        });
      }
    } catch {
      toast.error("Failed to move lead");
    }
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    try {
      await updateLeadStageMutation.mutateAsync({
        id: pendingMove.id,
        stage: pendingMove.toStage,
      });
      toast.success(`Lead moved to ${stageLabels[pendingMove.toStage] || pendingMove.toStage}`);
    } catch {
      // Error toast handled by hook's onError
    }
    setPendingMove(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {stageOrder.map((stage) => (
        <Card
          key={stage}
          className={`transition-all duration-200 ${draggedOverStage === stage ? "bg-muted/60 ring-2 ring-primary ring-offset-2 shadow-lg scale-102" : "bg-muted/30"} ${isDraggingCard ? "cursor-copy" : ""}`}
          onDragOver={handleDragOver}
          onDragEnter={() => setDraggedOverStage(stage)}
          onDragLeave={() => setDraggedOverStage(null)}
          onDrop={(e) => handleDrop(e, stage)}
        >
          <CardHeader>
            <CardTitle className="text-sm uppercase text-muted-foreground">
              {stage}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[100px]">
            {(pipeline[stage] || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No leads</div>
            ) : (
              (pipeline[stage] || []).map((lead) => (
                <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
              ))
            )}
          </CardContent>
        </Card>
      ))}
      <ConfirmDialog
        open={!!pendingMove}
        title="Move deal"
        description={
          pendingMove
            ? `Move "${pendingMove.leadName}" from ${stageLabels[pendingMove.fromStage] || pendingMove.fromStage} to ${stageLabels[pendingMove.toStage] || pendingMove.toStage}?`
            : ""
        }
        confirmLabel="Move"
        onConfirm={handleConfirmMove}
        onCancel={() => setPendingMove(null)}
        isLoading={updateLeadStageMutation.isPending}
      />
    </div>
  );
}
