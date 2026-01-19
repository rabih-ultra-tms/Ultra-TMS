"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import type { Role } from "@/lib/types/auth";
import { PageHeader, EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useDebounce } from "@/lib/hooks";
import { useDeleteRole, useRoles } from "@/lib/hooks/admin/use-roles";

export default function RolesListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading, error } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const roles = data?.data || [];

  const filteredRoles = useMemo(() => {
    if (!debouncedSearch) return roles;
    const query = debouncedSearch.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
    );
  }, [roles, debouncedSearch]);

  const total = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
  const paginatedRoles = filteredRoles.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const systemRolesCount = roles.filter((role) => role.isSystem).length;
  const customRolesCount = roles.filter((role) => !role.isSystem).length;
  const totalPermissions = roles.reduce((sum, role) => sum + role.permissions.length, 0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    deleteRoleMutation.mutate(roleId);
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles and their permissions"
        actions={
          <Link href="/admin/roles/new">
            <Button>Create Role</Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-slate-500 truncate">System Roles</dt>
                <dd className="flex items-baseline">
                  <div className="text-xl font-semibold text-slate-900">{systemRolesCount}</div>
                  <div className="ml-2 text-sm text-slate-500">protected</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-slate-500 truncate">Custom Roles</dt>
                <dd className="flex items-baseline">
                  <div className="text-xl font-semibold text-slate-900">{customRolesCount}</div>
                  <div className="ml-2 text-sm text-slate-500">tenant-specific</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-slate-500 truncate">Total Permissions</dt>
                <dd className="flex items-baseline">
                  <div className="text-xl font-semibold text-slate-900">{totalPermissions}</div>
                  <div className="ml-2 text-sm text-slate-500">across {roles.length} roles</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search roles by name or description..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading && !data ? (
        <LoadingState message="Loading roles..." />
      ) : error ? (
        <ErrorState title="Failed to load roles" message={error.message} />
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          title="No roles found"
          description={
            searchQuery ? "No roles found matching your search" : "No roles found"
          }
        />
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{role.name}</div>
                    {role.isSystem && (
                      <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        System
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    {role.description || "No description"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {role.permissions.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/roles/${role.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      {!role.isSystem && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredRoles.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          itemName="roles"
        />
      )}
    </div>
  );
}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-xs font-semibold text-blue-700">
                About Roles & Permissions
              </h3>
              <div className="mt-1 text-xs text-blue-700">
                <p>
                  System roles are pre-configured and cannot be deleted. They provide baseline access levels for common user types.
                  Create custom roles to define specific permission sets for your organization's needs.
                </p>
              </div>
            </div>
          </div>
        </div>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(() => {
          const filteredRoles = roles.filter(
            (role) =>
              role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              role.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const startIndex = (pagination.page - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          const pageRoles = filteredRoles.slice(startIndex, endIndex);
          return pageRoles;
        })().map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-md border border-slate-200 p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
                      System
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-600">{role.description}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-slate-500 mb-1.5">
                Permissions
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 5).map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700"
                  >
                    {permission}
                  </span>
                ))}
                {role.permissions.length > 5 && (
                  <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <div>
                Created {new Date(role.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              {!role.isSystem && (
                <>
                  <Link href={`/admin/roles/${role.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {roles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && !isLoading && (
        <div className="bg-white rounded-md border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            {searchQuery ? "No roles found matching your search" : "No roles found"}
          </p>
        </div>
      )}

      {filteredRoles.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          itemName="roles"
        />
      )}
    </div>
  );
}
