"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { userFormSchema, type UserFormData } from "@/lib/validations/auth";
import { useRoles } from "@/lib/hooks/admin/use-roles";
import { LoadingState } from "@/components/shared";

interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  submitLabel?: string;
  isLoading?: boolean;
}

const statusOptions: Array<UserFormData["status"]> = ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "LOCKED"];

export function UserForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save User",
  isLoading = false,
}: UserFormProps) {
  const rolesQuery = useRoles();
  const roles = rolesQuery.data?.data || [];
  
  console.log('Available roles:', roles);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      roleId: "",
      status: "ACTIVE",
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log('Form values before cleaning:', values);
    
    // Remove roleId if it's empty string or undefined
    const { roleId, ...rest } = values;
    const cleanedValues = roleId && roleId.trim() !== "" 
      ? { ...rest, roleId } 
      : rest;
    
    console.log('Cleaned values being submitted:', cleanedValues);
    await onSubmit(cleanedValues);
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                      {statusOptions.filter(Boolean).map((status) => (
                        <SelectItem key={status} value={status!}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
