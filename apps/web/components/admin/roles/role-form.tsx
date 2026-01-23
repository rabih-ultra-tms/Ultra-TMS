"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { roleFormSchema, type RoleFormData } from "@/lib/validations/auth";

interface RoleFormProps {
  defaultValues?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => Promise<void> | void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function RoleForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Role",
  isLoading = false,
}: RoleFormProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";
  
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissionIds: [],
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={cn(
          "border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg",
          isDark ? "border-gray-700 bg-gray-950" : "border-gray-200 bg-white"
        )}>
          <CardHeader className={cn(
            "pb-4 border-b",
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          )}>
            <CardTitle className={cn("text-lg font-semibold", isDark ? "text-gray-50" : "text-gray-900")}>Role details</CardTitle>
          </CardHeader>
          <CardContent className={cn("grid gap-5 pt-6 pb-6", isDark ? "bg-gray-950" : "bg-white")}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("font-medium text-base", isDark ? "text-gray-50" : "text-gray-900")}>Role name</FormLabel>
                  <FormControl>
                    <Input placeholder="admin" {...field} className={cn(
                      "transition-colors h-10 text-base",
                      isDark 
                        ? "border-gray-700 focus:border-gray-600 bg-gray-900 text-gray-50" 
                        : "border-gray-300 focus:border-gray-400 bg-white text-gray-900"
                    )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("font-medium text-base", isDark ? "text-gray-50" : "text-gray-900")}>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Administrator" {...field} className={cn(
                      "transition-colors h-10 text-base",
                      isDark 
                        ? "border-gray-700 focus:border-gray-600 bg-gray-900 text-gray-50" 
                        : "border-gray-300 focus:border-gray-400 bg-white text-gray-900"
                    )} />
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
                  <FormLabel className={cn("font-medium text-base", isDark ? "text-gray-50" : "text-gray-900")}>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Full admin access" {...field} className={cn(
                      "transition-colors h-10 text-base",
                      isDark 
                        ? "border-gray-700 focus:border-gray-600 bg-gray-900 text-gray-50" 
                        : "border-gray-300 focus:border-gray-400 bg-white text-gray-900"
                    )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isLoading} className={cn(
            "font-medium transition-colors duration-200 rounded-lg px-8 py-2.5 text-base",
            isDark
              ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
              : "bg-gray-900 hover:bg-gray-800 text-white"
          )}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
