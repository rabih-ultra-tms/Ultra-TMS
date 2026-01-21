"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerForm } from "@/components/crm/customers/customer-form";
import { Button } from "@/components/ui/button";
import { useCustomer, useUpdateCustomer } from "@/lib/hooks/crm/use-customers";
import type { CustomerFormData } from "@/lib/validations/crm";
import { LoadingState, ErrorState } from "@/components/shared";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = params.id;
  const { data, isLoading, error, refetch } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const customer = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load customer";

  const handleSubmit = async (values: CustomerFormData) => {
    await updateCustomer.mutateAsync({ id: customerId, data: values });
    router.push(`/customers/${customerId}`);
  };

  if (isLoading && !customer) {
    return <LoadingState message="Loading customer..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load customer" message={errorMessage} retry={refetch} />;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit customer"
        description={customer.name}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <CustomerForm
        defaultValues={{
          name: customer.name,
          legalName: customer.legalName,
          email: customer.email,
          phone: customer.phone,
          website: customer.website,
          industry: customer.industry,
          paymentTerms: customer.paymentTerms,
          creditLimit: customer.creditLimit,
          tags: customer.tags,
          address: customer.address,
        }}
        onSubmit={handleSubmit}
        submitLabel={updateCustomer.isPending ? "Saving..." : "Update Customer"}
        isLoading={updateCustomer.isPending}
      />
    </div>
  );
}
