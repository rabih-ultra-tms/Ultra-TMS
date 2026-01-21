"use client";

import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { RolesTable } from "@/components/admin/roles/roles-table";
import { useRoles } from "@/lib/hooks/admin/use-roles";
import { useCurrentUser, useHasRole } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api";

export default function RolesPage() {
  const router = useRouter();
  const { isLoading: isUserLoading } = useCurrentUser();
  const hasAdminAccess = useHasRole(["ADMIN", "SUPER_ADMIN"]);
  const { data, isLoading, error, refetch } = useRoles({ enabled: hasAdminAccess });

  const roles = data?.data || [];

  if (isUserLoading) {
    return <LoadingState message="Checking access..." />;
  }

  if (!hasAdminAccess) {
    return (
      <ErrorState
        title="Access denied"
        message="Your account does not have permission to view role management."
        action={<Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage role definitions"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => router.push("/admin/roles/new")}> 
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </>
        }
      />

      {isLoading && !data ? (
        <LoadingState message="Loading roles..." />
      ) : error ? (
        <ErrorState
          title="Failed to load roles"
          message={
            error instanceof ApiError && error.isForbidden()
              ? "You do not have permission to view roles in this tenant."
              : error instanceof Error
                ? error.message
                : "Failed to load roles"
          }
          retry={() => refetch()}
          action={
            error instanceof ApiError && error.isForbidden() ? (
              <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
            ) : undefined
          }
        />
      ) : roles.length === 0 ? (
        <EmptyState
          title="No roles found"
          description="Create a role to get started."
          action={<Button onClick={() => router.push("/admin/roles/new")}>Add Role</Button>}
        />
      ) : (
        <RolesTable roles={roles} onView={(id) => router.push(`/admin/roles/${id}`)} />
      )}
    </div>
  );
}
