import * as React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AddressFormProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  namePrefix: Path<TFieldValues>;
}

export function AddressForm<TFieldValues extends FieldValues>({
  control,
  namePrefix,
}: AddressFormProps<TFieldValues>) {
  const fieldName = (field: string) => `${namePrefix}.${field}` as Path<TFieldValues>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name={fieldName("street1")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="123 Main St" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("street2")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address 2</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Suite 100" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("city")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("state")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("postalCode")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("country")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
