"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerDetailCard } from "@/components/crm/customers/customer-detail-card";
import { CustomerTabs } from "@/components/crm/customers/customer-tabs";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useCustomer } from "@/lib/hooks/crm/use-customers";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = params.id;
  const { data, isLoading, error, refetch } = useCustomer(companyId);

  const company = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load company";

  if (isLoading && !company) {
    return <LoadingState message="Loading company..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load company" message={errorMessage} retry={refetch} />;
  }

  if (!company) {
    return (
      <EmptyState
        title="Company not found"
        description="We could not find the company record."
        action={<Button onClick={() => router.push("/companies")}>Back to companies</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        description={company.code}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/companies/${companyId}/edit`)}>
              Edit
            </Button>
            <Button onClick={() => router.push("/companies")}>Back</Button>
          </div>
        }
      />

      <CustomerTabs customerId={companyId} />
      <CustomerDetailCard customer={company} />
    </div>
  );
}
