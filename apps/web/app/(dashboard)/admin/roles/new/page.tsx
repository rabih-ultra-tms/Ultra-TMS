"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { RoleForm } from "@/components/admin/roles/role-form";
import { RolePermissionsEditor } from "@/components/admin/roles/role-permissions-editor";
import { useCreateRole, usePermissions } from "@/lib/hooks/admin/use-roles";
import type { RoleFormData } from "@/lib/validations/auth";
import { LoadingState } from "@/components/shared";
import { toast } from "@/components/ui/sonner";

export default function NewRolePage() {
  const router = useRouter();
  const createRole = useCreateRole();
  const permissionsQuery = usePermissions();
  const [permissionIds, setPermissionIds] = React.useState<string[]>([]);
  const [permissionError, setPermissionError] = React.useState<string>("");

  const handleSubmit = async (values: RoleFormData) => {
    if (permissionIds.length === 0) {
      setPermissionError("At least one permission is required");
      toast.error("Validation Error", {
        description: "Please select at least one permission for this role"
      });
      return;
    }
    setPermissionError("");
    await createRole.mutateAsync({ ...values, permissionIds });
    router.push("/admin/roles");
  };

  if (permissionsQuery.isLoading) {
    return <LoadingState message="Loading permissions..." />;
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <PageHeader
        title="Add role"
        description="Create a new role with custom permissions"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      
      <RoleForm
        defaultValues={{
          name: "",
          displayName: "",
          description: "",
          permissionIds: [],
        }}
        onSubmit={handleSubmit}
        submitLabel={createRole.isPending ? "Creating..." : "Create Role"}
        isLoading={createRole.isPending}
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
