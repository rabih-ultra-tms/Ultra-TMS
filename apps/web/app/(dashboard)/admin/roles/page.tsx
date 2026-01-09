"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@/lib/types/auth";

export default function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ data: Role[] }>("/auth/roles");
      setRoles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await apiClient.delete(`/auth/roles/${roleId}`);
      await loadRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading roles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage roles and their permissions
            </p>
          </div>
          <Link href="/admin/roles/new">
            <Button>Create Role</Button>
          </Link>
        </div>

        <div className="mt-4">
          <Input
            type="search"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                      System
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{role.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">
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
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div>
                Created {new Date(role.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/admin/roles/${role.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  Edit
                </Button>
              </Link>
              {!role.isSystem && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">
            {searchQuery ? "No roles found matching your search" : "No roles found"}
          </p>
        </div>
      )}
    </div>
  );
}
