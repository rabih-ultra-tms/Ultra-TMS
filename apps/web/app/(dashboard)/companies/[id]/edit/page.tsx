"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerForm } from "@/components/crm/customers/customer-form";
import { Button } from "@/components/ui/button";
import { useCustomer, useUpdateCustomer } from "@/lib/hooks/crm/use-customers";
import type { CustomerFormData } from "@/lib/validations/crm";
import { LoadingState, ErrorState } from "@/components/shared";

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = params.id;
  const { data, isLoading, error, refetch } = useCustomer(companyId);
  const updateCustomer = useUpdateCustomer();

  const company = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load company";

  const handleSubmit = async (values: CustomerFormData) => {
    await updateCustomer.mutateAsync({ id: companyId, data: values });
    router.push(`/companies/${companyId}`);
  };

  if (isLoading && !company) {
    return <LoadingState message="Loading company..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load company" message={errorMessage} retry={refetch} />;
  }

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit company"
        description={company.name}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <CustomerForm
        defaultValues={{
          name: company.name,
          legalName: company.legalName,
          email: company.email,
          phone: company.phone,
          website: company.website,
          industry: company.industry,
          paymentTerms: company.paymentTerms,
          creditLimit: company.creditLimit,
          tags: company.tags,
          address: company.address,
        }}
        onSubmit={handleSubmit}
        submitLabel={updateCustomer.isPending ? "Saving..." : "Update Company"}
        isLoading={updateCustomer.isPending}
      />
    </div>
  );
}
