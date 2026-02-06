"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  customerFormSchema,
  type CustomerFormData,
  type CustomerFormInput,
} from "@/lib/validations/crm";
import { AddressForm } from "@/components/crm/shared/address-form";
import { PhoneInput } from "@/components/crm/shared/phone-input";
import { Switch } from "@/components/ui/switch";
import { X, Building2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormInput>;
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  submitLabel?: string;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Company",
  isLoading = false,
  onCancel,
}: CustomerFormProps) {
  const router = useRouter();
  const [includeAddress, setIncludeAddress] = React.useState(
    defaultValues?.address !== undefined ? Boolean(defaultValues?.address) : true
  );
  const [logoPreview, setLogoPreview] = React.useState<string | null>(defaultValues?.logoUrl || null);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Sanitize defaultValues to convert null to empty string/undefined
  const sanitizedDefaults = React.useMemo(() => {
    if (!defaultValues) return undefined;
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(defaultValues)) {
      if (value === null || value === undefined) {
        if (key === 'address') {
          // Always initialize address with proper strings
          result[key] = {
            street1: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          };
        } else {
          result[key] = typeof value === 'string' ? '' : undefined;
        }
      } else if (key === 'address' && typeof value === 'object' && !Array.isArray(value)) {
        // Ensure all address fields are strings, never null/undefined
        const addressObj = value as Record<string, unknown>;
        result[key] = {
          street1: typeof addressObj.street1 === 'string' ? addressObj.street1 : '',
          street2: typeof addressObj.street2 === 'string' ? addressObj.street2 : '',
          city: typeof addressObj.city === 'string' ? addressObj.city : '',
          state: typeof addressObj.state === 'string' ? addressObj.state : '',
          postalCode: typeof addressObj.postalCode === 'string' ? addressObj.postalCode : '',
          country: typeof addressObj.country === 'string' ? addressObj.country : '',
        };
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }, [defaultValues]);

  const form = useForm<CustomerFormInput>({
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
      logoUrl: "",
      address: {
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      ...(sanitizedDefaults || {}),
    },
  });

  // Unregister address fields when includeAddress is false
  React.useEffect(() => {
    if (!includeAddress) {
      form.unregister("address");
    }
  }, [includeAddress, form]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ data: { logoUrl: string } }>(
        '/crm/companies/upload-logo',
        formData
      );

      const logoUrl = response.data.logoUrl;
      form.setValue('logoUrl', logoUrl);
      setLogoPreview(logoUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
      console.error('Logo upload error:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue('logoUrl', '');
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    // Build the payload explicitly to avoid sending address when not needed
    const payload: Record<string, unknown> = {
      name: values.name,
      legalName: values.legalName,
      email: values.email || undefined,
      phone: values.phone,
      website: values.website,
      industry: values.industry,
      paymentTerms: values.paymentTerms,
      creditLimit: values.creditLimit,
      tags: values.tags ?? [],
      logoUrl: values.logoUrl || undefined,
    };

    // Only include address if the user opted in
    if (includeAddress && values.address) {
      payload.addressLine1 = values.address.street1 || undefined;
      payload.addressLine2 = values.address.street2 || undefined;
      payload.city = values.address.city || undefined;
      payload.state = values.address.state || undefined;
      payload.postalCode = values.address.postalCode || undefined;
      payload.country = values.address.country || undefined;
    }

    await onSubmit(payload as CustomerFormData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-6">
              {/* Logo Section - Left Side */}
              <div className="flex-shrink-0">
                <div className="relative w-40 h-40 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center group">
                  {logoPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={logoPreview.startsWith('http') ? logoPreview : `http://localhost:3001${logoPreview}`}
                        alt="Company logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <Building2 className="h-16 w-16 text-muted-foreground/40" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo || isLoading}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isUploadingLogo ? 'Uploading...' : 'Update'}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={isLoading}
                        className="p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                        aria-label="Remove logo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo || isLoading}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Company Details - Right Side */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">Company details</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>
              </div>
            </div>
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
            <CardTitle className="flex items-center gap-2">
              Primary address
 
            </CardTitle>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
              <span className={`text-sm font-medium ${includeAddress ? "text-foreground" : "text-muted-foreground"}`}>
                {includeAddress ? "Address enabled" : "Add address"}
              </span>
              <Switch 
                checked={includeAddress} 
                onCheckedChange={setIncludeAddress}
                className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-600"
              />
            </div>
          </CardHeader>
          {includeAddress ? (
            <CardContent>
              <AddressForm control={form.control} namePrefix="address" />
            </CardContent>
          ) : null}
        </Card>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => (onCancel ? onCancel() : router.back())}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
