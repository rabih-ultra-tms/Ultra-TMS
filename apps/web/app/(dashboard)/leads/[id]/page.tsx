"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/components/crm/leads/lead-stage-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLead, useDeleteLead, useConvertLead } from "@/lib/hooks/crm/use-leads";
import { useContacts } from "@/lib/hooks/crm/use-contacts";
import { useCustomers } from "@/lib/hooks/crm/use-customers";
import { useActivities } from "@/lib/hooks/crm/use-activities";
import { LeadConvertDialog } from "@/components/crm/leads/lead-convert-dialog";
import { Trash2, ArrowRightLeft } from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params.id;
  const { data, isLoading, error, refetch } = useLead(leadId);
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const customersQuery = useCustomers({ limit: 100 });
  const [showDelete, setShowDelete] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

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

  const handleDelete = async () => {
    await deleteLead.mutateAsync(leadId);
    setShowDelete(false);
    router.push("/leads");
  };

  const handleConvert = async (customerId?: string) => {
    await convertLead.mutateAsync({ id: leadId, data: { customerId } });
    setShowConvert(false);
    router.push("/companies");
  };

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
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConvert(true)}
              disabled={convertLead.isPending}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Convert to Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDelete(true)}
              disabled={deleteLead.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
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

      <ConfirmDialog
        open={showDelete}
        title="Delete deal"
        description={`Are you sure you want to delete "${lead.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleteLead.isPending}
        destructive
      />
      <LeadConvertDialog
        open={showConvert}
        onOpenChange={setShowConvert}
        customers={customersQuery.data?.data || []}
        onConvert={handleConvert}
        isLoading={convertLead.isPending}
      />
    </div>
  );
}
