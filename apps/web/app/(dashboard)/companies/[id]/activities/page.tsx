"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { CustomerTabs } from "@/components/crm/customers/customer-tabs";
import { ActivityTimeline } from "@/components/crm/activities/activity-timeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useCustomer } from "@/lib/hooks/crm/use-customers";
import { useActivities } from "@/lib/hooks/crm/use-activities";

export default function CompanyActivitiesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = params.id;
  const { data: companyData } = useCustomer(companyId);
  const companyName = companyData?.data?.name || "Company";

  const { data, isLoading, error, refetch } = useActivities({
    companyId,
    page: 1,
    limit: 50,
  });

  const activities = data?.data || [];
  const errorMessage = error instanceof Error ? error.message : "Failed to load activities";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${companyName} activities`}
        description="Track company interactions"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <CustomerTabs customerId={companyId} />

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
