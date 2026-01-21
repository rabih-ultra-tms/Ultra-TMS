"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerForm } from "@/components/crm/customers/customer-form";
import { useCreateCustomer } from "@/lib/hooks/crm/use-customers";
import type { CustomerFormData } from "@/lib/validations/crm";
import { Button } from "@/components/ui/button";

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (data: CustomerFormData) => {
    const response = await createCustomer.mutateAsync(data);
    const id = response.data.id;
    router.push(`/customers/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add customer"
        description="Create a new customer profile"
        actions={<Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>}
      />
      <CustomerForm
        onSubmit={handleSubmit}
        submitLabel={createCustomer.isPending ? "Saving..." : "Create Customer"}
        isLoading={createCustomer.isPending}
      />
    </div>
  );
}
