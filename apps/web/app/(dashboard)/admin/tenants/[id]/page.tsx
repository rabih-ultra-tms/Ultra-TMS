"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/components/admin/tenants/tenant-form";
import { TenantSettingsForm } from "@/components/admin/tenants/tenant-settings-form";
import { TenantUsersSection } from "@/components/admin/tenants/tenant-users-section";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant settings"
        description={`Tenant ID: ${params.id}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <TenantForm />
        <TenantSettingsForm />
      </div>
      <TenantUsersSection users={[]} />
    </div>
  );
}
