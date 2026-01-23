"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerForm } from "@/components/crm/customers/customer-form";
import { useCreateCustomer } from "@/lib/hooks/crm/use-customers";
import type { CustomerFormData } from "@/lib/validations/crm";
import { Button } from "@/components/ui/button";

export default function NewCompanyPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (data: CustomerFormData) => {
    const response = await createCustomer.mutateAsync(data);
    const id = response.data.id;
    router.push(`/companies/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add company"
        description="Create a new company profile"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <CustomerForm
        onSubmit={handleSubmit}
        submitLabel={createCustomer.isPending ? "Saving..." : "Create Company"}
        isLoading={createCustomer.isPending}
      />
    </div>
  );
}
