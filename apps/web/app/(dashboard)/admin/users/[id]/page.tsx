"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { UserDetailCard } from "@/components/admin/users/user-detail-card";
import { UserRolesSection } from "@/components/admin/users/user-roles-section";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useUser } from "@/lib/hooks/admin/use-users";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;
  const { data, isLoading, error, refetch } = useUser(userId);
  const user = data?.data;

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
    return (
      <EmptyState
        title="User not found"
        description="We could not find that user."
        action={<Button onClick={() => router.push("/admin/users")}>Back to users</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}/edit`)}>
              Edit
            </Button>
            <Button onClick={() => router.push("/admin/users")}>Back</Button>
          </div>
        }
      />
      <UserDetailCard user={user} />
      <UserRolesSection roles={user.roles || []} />
    </div>
  );
}
