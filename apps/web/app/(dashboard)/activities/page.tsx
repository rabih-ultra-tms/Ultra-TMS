"use client";

import * as React from "react";
import { RefreshCw, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/crm/activities/activity-timeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useActivities } from "@/lib/hooks/crm/use-activities";

export default function ActivitiesPage() {
  const { data, isLoading, error, refetch } = useActivities({ page: 1, limit: 50 });
  const activities = data?.data || [];

  const errorMessage = error instanceof Error ? error.message : "Failed to load activities";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Track customer and deal interactions"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </>
        }
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
