"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/admin/users/user-form";
import { useUser, useUpdateUser } from "@/lib/hooks/admin/use-users";
import type { UpdateUserFormData } from "@/lib/validations/auth";
import { LoadingState, ErrorState } from "@/components/shared";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;
  const { data, isLoading, error, refetch } = useUser(userId);
  const updateUser = useUpdateUser();

  const user = data?.data;

  const handleSubmit = async (values: UpdateUserFormData) => {
    await updateUser.mutateAsync({ id: userId, data: values });
    router.push(`/admin/users/${userId}`);
  };

  if (isLoading && !user) {
    return <LoadingState message="Loading user..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load user"
        message={error instanceof Error ? error.message : "Failed to load user"}
        retry={refetch}
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit user"
        description={user.fullName}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
      <UserForm
        mode="edit"
        defaultValues={{
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roles?.[0]?.id || "",
          status: user.status,
        }}
        onSubmit={handleSubmit}
        submitLabel={updateUser.isPending ? "Saving..." : "Update User"}
        isLoading={updateUser.isPending}
      />
    </div>
  );
}
