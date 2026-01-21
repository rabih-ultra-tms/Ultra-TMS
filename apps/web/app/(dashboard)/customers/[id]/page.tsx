"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerDetailCard } from "@/components/crm/customers/customer-detail-card";
import { CustomerTabs } from "@/components/crm/customers/customer-tabs";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useCustomer } from "@/lib/hooks/crm/use-customers";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = params.id;
  const { data, isLoading, error, refetch } = useCustomer(customerId);

  const customer = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load customer";

  if (isLoading && !customer) {
    return <LoadingState message="Loading customer..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load customer" message={errorMessage} retry={refetch} />;
  }

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="We could not find the customer record."
        action={<Button onClick={() => router.push("/customers")}>Back to customers</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.code}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/customers/${customerId}/edit`)}>
              Edit
            </Button>
            <Button onClick={() => router.push("/customers")}>Back</Button>
          </div>
        }
      />

      <CustomerTabs customerId={customerId} />
      <CustomerDetailCard customer={customer} />
    </div>
  );
}
