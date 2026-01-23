"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { CustomerTabs } from "@/components/crm/customers/customer-tabs";
import { ContactsTable } from "@/components/crm/contacts/contacts-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useCustomer } from "@/lib/hooks/crm/use-customers";
import { useContacts } from "@/lib/hooks/crm/use-contacts";

export default function CompanyContactsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = params.id;
  const { data: companyData } = useCustomer(companyId);
  const companyName = companyData?.data?.name || "Company";
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useContacts({
    page,
    limit: 20,
    companyId,
  });

  const contacts = data?.data || [];
  const errorMessage = error instanceof Error ? error.message : "Failed to load contacts";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${companyName} contacts`}
        description="Manage company contacts"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <CustomerTabs customerId={companyId} />

      {isLoading && !data ? (
        <LoadingState message="Loading contacts..." />
      ) : error ? (
        <ErrorState title="Failed to load contacts" message={errorMessage} retry={refetch} />
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts" description="No contacts have been added yet." />
      ) : (
        <ContactsTable
          contacts={contacts}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={(id) => router.push(`/contacts/${id}`)}
        />
      )}
    </div>
  );
}
