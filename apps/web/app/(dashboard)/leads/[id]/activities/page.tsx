"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/crm/activities/activity-timeline";
import { ActivityForm } from "@/components/crm/activities/activity-form";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLead } from "@/lib/hooks/crm/use-leads";
import { useActivities } from "@/lib/hooks/crm/use-activities";
import { useCreateActivity } from "@/lib/hooks/crm/use-activities";
import type { ActivityFormData } from "@/lib/validations/crm";

export default function LeadActivitiesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params.id;

  const { data: leadData } = useLead(leadId);
  const leadName = leadData?.data?.name || "Lead";

  const createActivity = useCreateActivity();

  const { data, isLoading, error, refetch } = useActivities({
    page: 1,
    limit: 50,
    leadId,
  });

  const activities = data?.data || [];
  const errorMessage = error instanceof Error ? error.message : "Failed to load activities";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${leadName} activities`}
        description="Activity history for this lead"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <ActivityForm
        onSubmit={async (values: ActivityFormData) => {
          await createActivity.mutateAsync({
            ...values,
            leadId,
          });
        }}
        submitLabel={createActivity.isPending ? "Logging..." : "Log Activity"}
        isLoading={createActivity.isPending}
      />

      {isLoading && !data ? (
        <LoadingState message="Loading activities..." />
      ) : error ? (
        <ErrorState title="Failed to load activities" message={errorMessage} retry={refetch} />
      ) : activities.length === 0 ? (
        <EmptyState title="No activities" description="No activity history yet." />
      ) : (
        <ActivityTimeline activities={activities} />
      )}
    </div>
  );
}
