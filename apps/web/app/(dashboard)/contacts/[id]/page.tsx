"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/crm/contacts/contact-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useContact, useDeleteContact } from "@/lib/hooks/crm/use-contacts";
import { Trash2 } from "lucide-react";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contactId = params.id;
  const { data, isLoading, error, refetch } = useContact(contactId);
  const deleteContact = useDeleteContact();
  const [showDelete, setShowDelete] = useState(false);

  const contact = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load contact";

  const handleDelete = async () => {
    await deleteContact.mutateAsync(contactId);
    setShowDelete(false);
    router.push("/contacts");
  };

  if (isLoading && !contact) {
    return <LoadingState message="Loading contact..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load contact" message={errorMessage} retry={refetch} />;
  }

  if (!contact) {
    return (
      <EmptyState
        title="Contact not found"
        description="We could not find that contact."
        action={<Button onClick={() => router.push("/contacts")}>Back to contacts</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contact.fullName || `${contact.firstName} ${contact.lastName}`.trim()}
        description={contact.title || "Contact details"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/contacts/${contactId}/edit`)}>
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDelete(true)}
              disabled={deleteContact.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />
      <ContactCard contact={contact} />
      <ConfirmDialog
        open={showDelete}
        title="Delete contact"
        description={`Are you sure you want to delete "${contact.fullName || `${contact.firstName} ${contact.lastName}`.trim()}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleteContact.isPending}
        destructive
      />
    </div>
  );
}
