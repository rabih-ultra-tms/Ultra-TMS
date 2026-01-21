"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserForm } from "@/components/admin/users/user-form";
import { Button } from "@/components/ui/button";
import { useCreateUser } from "@/lib/hooks/admin/use-users";
import type { UserFormData } from "@/lib/validations/auth";

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  const handleSubmit = async (data: UserFormData) => {
    await createUser.mutateAsync(data);
    router.push("/admin/users");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add user"
        description="Create a new user account"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <UserForm
        onSubmit={handleSubmit}
        submitLabel={createUser.isPending ? "Saving..." : "Create User"}
        isLoading={createUser.isPending}
      />
    </div>
  );
}
