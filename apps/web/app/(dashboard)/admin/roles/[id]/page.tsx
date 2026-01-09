"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@/lib/types/auth";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const PERMISSION_CATEGORIES = [
  {
    name: "Authentication & Users",
    permissions: [
      "auth.login",
      "auth.logout",
      "auth.refresh",
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "users.invite",
    ],
  },
  {
    name: "Roles & Permissions",
    permissions: [
      "roles.view",
      "roles.create",
      "roles.update",
      "roles.delete",
      "permissions.view",
    ],
  },
  {
    name: "CRM",
    permissions: [
      "crm.view",
      "crm.companies.manage",
      "crm.contacts.manage",
      "crm.opportunities.manage",
      "crm.activities.manage",
    ],
  },
  {
    name: "Sales",
    permissions: [
      "sales.view",
      "sales.quotes.create",
      "sales.quotes.update",
      "sales.quotes.delete",
      "sales.contracts.manage",
    ],
  },
  {
    name: "TMS Core",
    permissions: [
      "tms.view",
      "tms.orders.create",
      "tms.orders.update",
      "tms.orders.delete",
      "tms.loads.manage",
      "tms.dispatch",
    ],
  },
  {
    name: "Carriers",
    permissions: [
      "carriers.view",
      "carriers.create",
      "carriers.update",
      "carriers.delete",
      "carriers.onboarding",
    ],
  },
  {
    name: "Accounting",
    permissions: [
      "accounting.view",
      "accounting.invoices.create",
      "accounting.invoices.approve",
      "accounting.payments.process",
      "accounting.settlements",
    ],
  },
  {
    name: "Analytics",
    permissions: ["analytics.view", "analytics.reports", "analytics.export"],
  },
];

export default function RoleEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (!isNew) {
      loadRole();
    }
  }, [params.id, isNew]);

  const loadRole = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<Role>(`/auth/roles/${params.id}`);
      setRole(response);

      form.reset({
        name: response.name,
        description: response.description,
        permissions: response.permissions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load role");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RoleFormValues) => {
    setIsSaving(true);

    try {
      if (isNew) {
        await apiClient.post("/auth/roles", data);
      } else {
        await apiClient.put(`/auth/roles/${params.id}`, data);
      }
      router.push("/admin/roles");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    const current = form.getValues("permissions");
    if (current.includes(permission)) {
      form.setValue(
        "permissions",
        current.filter((p) => p !== permission)
      );
    } else {
      form.setValue("permissions", [...current, permission]);
    }
  };

  const selectAllInCategory = (permissions: string[]) => {
    const current = form.getValues("permissions");
    const allSelected = permissions.every((p) => current.includes(p));

    if (allSelected) {
      form.setValue(
        "permissions",
        current.filter((p) => !permissions.includes(p))
      );
    } else {
      form.setValue(
        "permissions",
        Array.from(new Set([...current, ...permissions]))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading role...</div>
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

  if (!isNew && role?.isSystem) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="text-sm text-yellow-800">
            This is a system role and cannot be edited.
          </div>
        </div>
        <div className="mt-4">
          <Link href="/admin/roles">
            <Button variant="outline">Back to roles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/roles">
          <Button variant="ghost" size="sm" className="mb-2">
            ← Back to roles
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Create Role" : `Edit ${role?.name}`}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Define role name, description, and permissions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Operations Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Describe the role's responsibilities..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Permissions
            </h2>
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="space-y-6">
                    {PERMISSION_CATEGORIES.map((category) => {
                      const selectedPermissions = form.watch("permissions");
                      const allSelected = category.permissions.every((p) =>
                        selectedPermissions.includes(p)
                      );

                      return (
                        <div key={category.name} className="border-b pb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-900">
                              {category.name}
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                selectAllInCategory(category.permissions)
                              }
                            >
                              {allSelected ? "Deselect all" : "Select all"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {category.permissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  checked={selectedPermissions.includes(
                                    permission
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(permission)
                                  }
                                />
                                <label className="text-sm text-gray-700">
                                  {permission}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin/roles">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isNew ? "Create role" : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
