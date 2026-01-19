"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import type { User } from "@/lib/types/auth";
import { PageHeader, EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useDebounce } from "@/lib/hooks";
import { useActivateUser, useDeactivateUser, useInviteUser, useUsers } from "@/lib/hooks/admin/use-users";

export default function UsersListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading, error } = useUsers({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
  });
  const inviteMutation = useInviteUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const users = data?.data || [];

  useEffect(() => {
    if (!data) return;
    if (pagination.total !== data.total || pagination.totalPages !== data.totalPages) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    }
  }, [data, pagination.total, pagination.totalPages]);

  const getStatusBadge = (status: User["status"]) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        actions={
          <Link href="/admin/users/new">
            <Button>Add User</Button>
          </Link>
        }
      />

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading && !data ? (
        <LoadingState message="Loading users..." />
      ) : error ? (
        <ErrorState title="Failed to load users" message={error.message} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            searchQuery ? "No users found matching your search" : "No users found"
          }
        />
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-slate-600 font-medium">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{user.role.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      {user.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => inviteMutation.mutate(user.id)}
                        >
                          Resend Invite
                        </Button>
                      )}
                      {user.status === "INACTIVE" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => activateMutation.mutate(user.id)}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateMutation.mutate(user.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          itemName="users"
        />
      )}
    </div>
  );
}
