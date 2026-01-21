"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/crm/leads/lead-form";
import { Button } from "@/components/ui/button";
import { useCreateLead } from "@/lib/hooks/crm/use-leads";
import type { LeadFormData } from "@/lib/validations/crm";

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const handleSubmit = async (data: LeadFormData) => {
    const response = await createLead.mutateAsync(data);
    const id = response.data.id;
    router.push(`/leads/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add lead"
        description="Create a new lead"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <LeadForm
        onSubmit={handleSubmit}
        submitLabel={createLead.isPending ? "Saving..." : "Create Lead"}
        isLoading={createLead.isPending}
      />
    </div>
  );
}
