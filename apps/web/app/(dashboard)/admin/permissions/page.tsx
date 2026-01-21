"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionsMatrix } from "@/components/admin/permissions/permissions-matrix";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { usePermissions } from "@/lib/hooks/admin/use-roles";

export default function PermissionsPage() {
  const { data, isLoading, error, refetch } = usePermissions();

  const permissions = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="Review available permissions" />

      {isLoading && !data ? (
        <LoadingState message="Loading permissions..." />
      ) : error ? (
        <ErrorState
          title="Failed to load permissions"
          message={error instanceof Error ? error.message : "Failed to load permissions"}
          retry={refetch}
        />
      ) : permissions.length === 0 ? (
        <EmptyState title="No permissions" description="No permissions found." />
      ) : (
        <PermissionsMatrix permissions={permissions} />
      )}
    </div>
  );
}
