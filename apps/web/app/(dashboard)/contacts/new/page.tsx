"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/crm/contacts/contact-form";
import { useCreateContact } from "@/lib/hooks/crm/use-contacts";
import type { ContactFormData } from "@/lib/validations/crm";
import { Button } from "@/components/ui/button";

export default function NewContactPage() {
  const router = useRouter();
  const createContact = useCreateContact();

  const handleSubmit = async (data: ContactFormData) => {
    const response = await createContact.mutateAsync(data);
    const id = response.data.id;
    router.push(`/contacts/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add contact"
        description="Create a new contact profile"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <ContactForm
        onSubmit={handleSubmit}
        submitLabel={createContact.isPending ? "Saving..." : "Create Contact"}
        isLoading={createContact.isPending}
      />
    </div>
  );
}
