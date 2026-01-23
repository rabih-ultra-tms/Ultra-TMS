"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, Save, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { RolePermissionsEditor } from "@/components/admin/roles/role-permissions-editor";
import { LoadingState, ErrorState } from "@/components/shared";
import { useRole, usePermissions, useUpdateRole, useDeleteRole } from "@/lib/hooks/admin/use-roles";
import { roleFormSchema, type RoleFormData } from "@/lib/validations/auth";

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = params.id;
  
  const { data: roleData, isLoading: isLoadingRole, error } = useRole(roleId);
  const { data: permissionsData } = usePermissions();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const role = roleData?.data;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissionIds: [],
    },
  });

  // Reset form when role data loads
  React.useEffect(() => {
    if (role) {
      const permissionIds = Array.isArray(role.permissions)
        ? role.permissions.map((p: string | { name?: string; code?: string }) => {
            if (typeof p === 'string') return p;
            return p.code || p.name || String(p);
          })
        : [];

      form.reset({
        name: role.name,
        displayName: role.displayName || role.name,
        description: role.description || "",
        permissionIds: permissionIds,
      }, { shouldValidate: false });
    }
  }, [role, form]);

  const onSubmit = async (values: RoleFormData) => {
    try {
      await updateRole.mutateAsync({ id: roleId, data: values });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole.mutateAsync(roleId);
      router.push("/admin/roles");
    } catch (error) {
       console.error(error);
    }
  };

  if (isLoadingRole) {
    return <LoadingState message="Loading role details..." />;
  }

  if (error || !role) {
    return (
      <ErrorState
        title="Role not found"
        message={error instanceof Error ? error.message : "The requested role could not be loaded."}
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 container mx-auto pb-10 max-w-[1920px] px-4 sm:px-6 lg:px-8">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{role.displayName}</h1>
            <p className="text-sm text-muted-foreground">Manage role details and permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={role.isSystem}>
                   <Trash className="mr-2 h-4 w-4" />
                   Delete Role
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the role 
                    <span className="font-semibold text-foreground"> {role.displayName} </span> 
                    and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button onClick={form.handleSubmit(onSubmit)} disabled={updateRole.isPending} className="min-w-[140px]">
              {updateRole.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Role Details */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Overview</CardTitle>
                            <CardDescription>Basic information about this role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                              control={form.control}
                              name="displayName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Display Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Sales Manager" {...field} disabled={role.isSystem} />
                                  </FormControl>
                                  <FormDescription>The visible name of the role. ({role.name})</FormDescription>
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
                                    <Input placeholder="Describe what this role does..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {role.isSystem && (
                                <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 border border-yellow-200 dark:border-yellow-900">
                                   <p className="text-xs text-yellow-800 dark:text-yellow-500 font-medium">
                                       System roles cannot have their code changed or be deleted.
                                   </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Permissions */}
                <div className="lg:col-span-8">
                     <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>Configure access rights for this role.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                              control={form.control}
                              name="permissionIds"
                              render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {permissionsData?.data ? (
                                             <RolePermissionsEditor 
                                                permissions={permissionsData.data}
                                                selectedIds={field.value}
                                                onChange={field.onChange}
                                             />
                                        ) : (
                                            <LoadingState message="Loading permissions..." />
                                        )}
                                    </FormControl>
                                    <div className="pt-2">
                                        <FormMessage />
                                    </div>
                                </FormItem>
                              )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
