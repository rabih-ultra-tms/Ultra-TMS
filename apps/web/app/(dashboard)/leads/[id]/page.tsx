"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/components/crm/leads/lead-stage-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLead } from "@/lib/hooks/crm/use-leads";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params.id;
  const { data, isLoading, error, refetch } = useLead(leadId);

  const lead = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load lead";

  if (isLoading && !lead) {
    return <LoadingState message="Loading lead..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load lead" message={errorMessage} retry={refetch} />;
  }

  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="We could not find that lead."
        action={<Button onClick={() => router.push("/leads")}>Back to leads</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.title}
        description={lead.companyName || "Lead details"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lead overview</CardTitle>
          <LeadStageBadge stage={lead.stage} />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Contact</p>
            <p className="font-medium">{lead.contactName || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{lead.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{lead.phone || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Probability</p>
            <p className="font-medium">{lead.probability}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
