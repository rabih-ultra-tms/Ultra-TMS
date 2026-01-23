"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  createUserFormSchema,
  updateUserFormSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  type UserFormData,
  type UserFormInput,
} from "@/lib/validations/auth";
import { useRoles } from "@/lib/hooks/admin/use-roles";
import { LoadingState } from "@/components/shared";

type UserFormMode = "create" | "edit";

function isUuid(value: string | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

interface UserFormProps {
  mode?: UserFormMode;
  defaultValues?: Partial<UserFormInput>;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  submitLabel?: string;
  isLoading?: boolean;
}

const statusOptions: Array<NonNullable<UpdateUserFormData["status"]>> = [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "SUSPENDED",
  "LOCKED",
  "INVITED",
];

export function UserForm({
  mode = "create",
  defaultValues,
  onSubmit,
  submitLabel = "Save User",
  isLoading = false,
}: UserFormProps) {
  const rolesQuery = useRoles();
  const roles = rolesQuery.data?.data || [];

  const defaultCreateValues: CreateUserFormData = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roleId: "",
    ...defaultValues,
  } as CreateUserFormData;

  const defaultEditValues: UpdateUserFormData = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roleId: "",
    status: "ACTIVE",
    ...defaultValues,
  } as UpdateUserFormData;

  const resolver = mode === "create" ? createUserFormSchema : updateUserFormSchema;

  const form = useForm<UserFormInput>({
    resolver: zodResolver(resolver),
    defaultValues: mode === "create" ? defaultCreateValues : defaultEditValues,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const cleanedRoleId = isUuid(values.roleId?.trim()) ? values.roleId?.trim() : undefined;
    const cleanedPassword = values.password && values.password.trim() !== "" ? values.password : undefined;
    const base = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
    };

    if (mode === "create") {
      const payload: CreateUserFormData = {
        ...base,
        roleId: cleanedRoleId,
        password: cleanedPassword ?? values.password ?? "",
      };
      await onSubmit(payload);
      return;
    }

    const status = "status" in values ? values.status : undefined;
    const payload: UpdateUserFormData = {
      ...base,
      roleId: cleanedRoleId,
      password: cleanedPassword,
      ...(status ? { status } : {}),
    };

    await onSubmit(payload);
  });

  if (rolesQuery.isLoading) {
    return <LoadingState message="Loading roles..." />;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email</FormLabel>
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span>{role.displayName || role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "edit" && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mode === "create" ? "Password" : "New password (optional)"}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
