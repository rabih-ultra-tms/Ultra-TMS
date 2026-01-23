"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Users, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserFilters } from "@/components/admin/users/user-filters";
import { useUsers } from "@/lib/hooks/admin/use-users";
import { useAdminStore } from "@/lib/stores/admin-store";
import { useDebounce } from "@/lib/hooks";
import { useCurrentUser, useHasRole } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api";

export default function UsersPage() {
  const router = useRouter();
  const { userFilters } = useAdminStore();
  const debouncedSearch = useDebounce(userFilters.search, 300);
  const [page, setPage] = React.useState(1);
  const { isLoading: isUserLoading } = useCurrentUser();
  const hasAdminAccess = useHasRole(["ADMIN", "SUPER_ADMIN"]);

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit: 20,
    search: debouncedSearch,
    status: userFilters.status || undefined,
    roleId: userFilters.roleId || undefined,
  }, { enabled: hasAdminAccess });

  const handleCreate = () => router.push("/admin/users/new");
  const handleView = (id: string) => router.push(`/admin/users/${id}`);

  const users = data?.data || [];
  const activeCount = users.filter((user) => user.status === "ACTIVE").length;
  const pendingCount = users.filter((user) => user.status === "PENDING").length;
  const suspendedCount = users.filter((user) => user.status === "SUSPENDED").length;

  if (isUserLoading) {
    return <LoadingState message="Checking access..." />;
  }

  if (!hasAdminAccess) {
    return (
      <ErrorState
        title="Access denied"
        message="Your account does not have permission to view user management."
        action={<Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users and their access"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedCount}</div>
          </CardContent>
        </Card>
      </div>

      <UserFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading users..." />
      ) : error ? (
        <ErrorState
          title="Failed to load users"
          message={
            error instanceof ApiError && error.isForbidden()
              ? "You do not have permission to view users in this tenant."
              : error instanceof Error
                ? error.message
                : "Failed to load users"
          }
          retry={() => refetch()}
          action={
            error instanceof ApiError && error.isForbidden() ? (
              <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
            ) : undefined
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by adding your first user."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
      ) : (
        <UsersTable
          users={users}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
