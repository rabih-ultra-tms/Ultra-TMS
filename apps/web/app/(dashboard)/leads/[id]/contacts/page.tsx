"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/components/crm/contacts/contacts-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useLead } from "@/lib/hooks/crm/use-leads";
import { useContacts } from "@/lib/hooks/crm/use-contacts";

export default function LeadContactsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params.id;
  const [page, setPage] = React.useState(1);

  const { data: leadData } = useLead(leadId);
  const companyId = leadData?.data?.companyId;
  const leadName = leadData?.data?.name || "Lead";

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
        title={`${leadName} contacts`}
        description="Contacts tied to the lead’s company"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

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
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
