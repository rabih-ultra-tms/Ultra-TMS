"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/crm/contacts/contact-form";
import { Button } from "@/components/ui/button";
import { useContact, useUpdateContact } from "@/lib/hooks/crm/use-contacts";
import type { ContactFormData } from "@/lib/validations/crm";
import { LoadingState, ErrorState } from "@/components/shared";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contactId = params.id;
  const { data, isLoading, error, refetch } = useContact(contactId);
  const updateContact = useUpdateContact();

  const contact = data?.data;
  const errorMessage = error instanceof Error ? error.message : "Failed to load contact";

  const handleSubmit = async (values: ContactFormData) => {
    await updateContact.mutateAsync({ id: contactId, data: values });
    router.push(`/contacts/${contactId}`);
  };

  if (isLoading && !contact) {
    return <LoadingState message="Loading contact..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load contact" message={errorMessage} retry={refetch} />;
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit contact"
        description={contact.fullName || `${contact.firstName} ${contact.lastName}`.trim()}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <ContactForm
        defaultValues={{
          firstName: contact.firstName,
          lastName: contact.lastName,
          title: contact.title,
          department: contact.department,
          email: contact.email,
          phone: contact.phone,
          mobile: contact.mobile,
          isPrimary: contact.isPrimary,
          notes: contact.notes,
        }}
        onSubmit={handleSubmit}
        submitLabel={updateContact.isPending ? "Saving..." : "Update Contact"}
        isLoading={updateContact.isPending}
      />
    </div>
  );
}
