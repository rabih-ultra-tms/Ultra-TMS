"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/components/crm/leads/lead-stage-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLead } from "@/lib/hooks/crm/use-leads";
import { useContacts } from "@/lib/hooks/crm/use-contacts";
import { useActivities } from "@/lib/hooks/crm/use-activities";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params.id;
  const { data, isLoading, error, refetch } = useLead(leadId);

  const lead = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load lead";

  const companyId = lead?.companyId;
  const contactsQuery = useContacts({
    page: 1,
    limit: 3,
    companyId,
  });
  const activitiesQuery = useActivities({
    page: 1,
    limit: 3,
    leadId,
  });

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
        title={lead.name}
        description={lead.company?.name || "Lead details"}
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
            <p className="text-sm text-muted-foreground">Primary contact</p>
            <p className="font-medium">
              {lead.primaryContact
                ? `${lead.primaryContact.firstName} ${lead.primaryContact.lastName}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Company</p>
            <p className="font-medium">{lead.company?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="font-medium">
              {lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Probability</p>
            <p className="font-medium">{lead.probability ?? 0}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected close</p>
            <p className="font-medium">{lead.expectedCloseDate || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Top contacts</CardTitle>
              <p className="text-sm text-muted-foreground">Top 3 contacts for this lead</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/leads/${leadId}/contacts`)}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {contactsQuery.isLoading ? (
              <LoadingState message="Loading contacts..." />
            ) : contactsQuery.data?.data?.length ? (
              contactsQuery.data.data.map((contact) => (
                <div key={contact.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">
                    {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.title || contact.department || "Contact"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.email || contact.phone || contact.mobile || "—"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No contacts" description="No contacts linked yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent activities</CardTitle>
              <p className="text-sm text-muted-foreground">Latest 3 activities for this lead</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/leads/${leadId}/activities`)}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activitiesQuery.isLoading ? (
              <LoadingState message="Loading activities..." />
            ) : activitiesQuery.data?.data?.length ? (
              activitiesQuery.data.data.map((activity) => (
                <div key={activity.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{activity.subject}</p>
                  {activity.description ? (
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {activity.dueDate || activity.activityDate || activity.createdAt}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No activities" description="No activity history yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
