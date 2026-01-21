"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/components/crm/contacts/contacts-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useContacts } from "@/lib/hooks/crm/use-contacts";

export default function ContactsPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useContacts({ page, limit: 20 });

  const contacts = data?.data || [];
  const errorMessage = error instanceof Error ? error.message : "Failed to load contacts";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage customer contacts"
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        }
      />

      {isLoading && !data ? (
        <LoadingState message="Loading contacts..." />
      ) : error ? (
        <ErrorState title="Failed to load contacts" message={errorMessage} retry={refetch} />
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts" description="No contacts have been created yet." />
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
