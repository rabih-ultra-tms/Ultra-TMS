"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { RoleForm } from "@/components/admin/roles/role-form";
import { RolePermissionsEditor } from "@/components/admin/roles/role-permissions-editor";
import { useRole, usePermissions, useUpdateRole } from "@/lib/hooks/admin/use-roles";
import type { RoleFormData } from "@/lib/validations/auth";
import { LoadingState, ErrorState } from "@/components/shared";
import { toast } from "@/components/ui/sonner";

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = params.id;
  const { data, isLoading, error, refetch } = useRole(roleId);
  const permissionsQuery = usePermissions();
  const updateRole = useUpdateRole();

  const role = data?.data;
  const [permissionIds, setPermissionIds] = React.useState<string[]>([]);
  const [permissionError, setPermissionError] = React.useState<string>("");

  React.useEffect(() => {
    if (role?.permissions) {
      // Handle both array of permission strings and array of permission objects
      const ids = Array.isArray(role.permissions)
        ? role.permissions.map((p: string | { name?: string; code?: string }) => {
            if (typeof p === 'string') return p;
            return p.name || p.code || String(p);
          })
        : [];
      setPermissionIds(ids);
    }
  }, [role]);

  const handleSubmit = async (values: RoleFormData) => {
    if (permissionIds.length === 0) {
      setPermissionError("At least one permission is required");
      toast.error("Validation Error", {
        description: "Please select at least one permission for this role"
      });
      return;
    }
    setPermissionError("");
    await updateRole.mutateAsync({ id: roleId, data: { ...values, permissionIds } });
    router.push("/admin/roles");
  };

  if (isLoading && !role) {
    return <LoadingState message="Loading role..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load role"
        message={error instanceof Error ? error.message : "Failed to load role"}
        retry={refetch}
      />
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.displayName || role.name}
        description="Edit role details"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <RoleForm
        defaultValues={{
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissionIds: permissionIds,
        }}
        onSubmit={handleSubmit}
        submitLabel={updateRole.isPending ? "Saving..." : "Update Role"}
        isLoading={updateRole.isPending}
      />

      {permissionsQuery.data?.data ? (
        <div className="space-y-2">
          <RolePermissionsEditor
            permissions={permissionsQuery.data.data}
            selectedIds={permissionIds}
            onChange={(ids) => {
              setPermissionIds(ids);
              if (ids.length > 0) setPermissionError("");
            }}
          />
          {permissionError && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <span className="inline-block">⚠</span>
              {permissionError}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
