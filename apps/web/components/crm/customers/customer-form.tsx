"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { customerFormSchema, type CustomerFormData } from "@/lib/validations/crm";
import { AddressForm } from "@/components/crm/shared/address-form";
import { PhoneInput } from "@/components/crm/shared/phone-input";
import { Switch } from "@/components/ui/switch";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Customer",
  isLoading = false,
}: CustomerFormProps) {
  const [includeAddress, setIncludeAddress] = React.useState(
    Boolean(defaultValues?.address)
  );
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    shouldUnregister: true,
    defaultValues: {
      name: "",
      legalName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      paymentTerms: "",
      creditLimit: undefined,
      tags: [],
      address: undefined,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const normalized = {
      ...values,
      address: includeAddress ? values.address : undefined,
      tags:
        typeof values.tags === "string"
          ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : values.tags,
    } as CustomerFormData;

    await onSubmit(normalized);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal name</FormLabel>
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
                <FormItem>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & tags</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment terms</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creditLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === "" ? undefined : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Logistics, Enterprise"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Primary address</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Add address</span>
              <Switch checked={includeAddress} onCheckedChange={setIncludeAddress} />
            </div>
          </CardHeader>
          {includeAddress ? (
            <CardContent>
              <AddressForm control={form.control} namePrefix="address" />
            </CardContent>
          ) : null}
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
