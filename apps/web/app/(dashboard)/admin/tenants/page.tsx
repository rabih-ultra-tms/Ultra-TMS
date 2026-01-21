"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useTenant } from "@/lib/hooks/admin/use-tenant";
import { TenantsTable } from "@/components/admin/tenants/tenants-table";
import { useRouter } from "next/navigation";

export default function TenantsPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useTenant();

  if (isLoading && !data) {
    return <LoadingState message="Loading tenants..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load tenant"
        message={error instanceof Error ? error.message : "Failed to load tenant"}
        retry={refetch}
      />
    );
  }

  if (!data) {
    return <EmptyState title="No tenant data" description="No tenant data available." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Tenant management" />
      <TenantsTable tenants={[data]} onView={(id) => router.push(`/admin/tenants/${id}`)} />
    </div>
  );
}

