import * as React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
