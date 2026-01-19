"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useRoles } from "@/lib/hooks/admin/use-roles";
import {
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUser,
} from "@/lib/hooks/admin/use-users";

const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
  title: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const userQuery = useUser(params.id);
  const rolesQuery = useRoles();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useResetUserPassword();
  const user = userQuery.data ?? null;
  const roles = rolesQuery.data?.data ?? [];
  const isLoading = userQuery.isLoading || rolesQuery.isLoading;
  const errorMessage = userQuery.error
    ? userQuery.error instanceof Error
      ? userQuery.error.message
      : "Failed to load user"
    : rolesQuery.error
    ? rolesQuery.error instanceof Error
      ? rolesQuery.error.message
      : "Failed to load roles"
    : null;
  const isSaving = updateUserMutation.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roleId: "",
      phone: "",
      title: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.role.id,
      phone: user.phone ?? "",
      title: user.title ?? "",
    });
  }, [form, user]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      await updateUserMutation.mutateAsync({ id: params.id, data });
      router.push("/admin/users");
    } catch {
      // handled by mutation
    }
  };

  const handleResetPassword = () => {
    if (!confirm("Send password reset email to this user?")) return;
    resetPasswordMutation.mutate(params.id);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await deleteUserMutation.mutateAsync(params.id);
      router.push("/admin/users");
    } catch {
      // handled by mutation
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading user..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        backButton={
          <Link href="/admin/users">
            <Button variant="outline">Back to users</Button>
          </Link>
        }
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="We couldn't find the user you're looking for."
        action={
          <Link href="/admin/users">
            <Button variant="outline">Back to users</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="mb-2">
                ← Back to users
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetPassword}>
              Reset Password
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              User Information
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select a role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job title (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Link href="/admin/users">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1 text-sm font-medium">{user.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last login</div>
                <div className="mt-1 text-sm">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="mt-1 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Updated</div>
                <div className="mt-1 text-sm">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
