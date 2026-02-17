"use client";

import { FormPage, FormSection } from "@/components/patterns/form-page";
import { carrierSchema, CarrierFormValues } from "@/lib/validations/carriers";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface CarrierFormProps {
    initialData?: Partial<CarrierFormValues>;
    carrierId?: string; // For back link context
    onSubmit: (data: CarrierFormValues) => Promise<void>;
    isLoading?: boolean;
    isSubmitting?: boolean;
}

export function CarrierForm({
    initialData,
    carrierId,
    onSubmit,
    isLoading,
    isSubmitting,
}: CarrierFormProps) {
    const isEdit = !!initialData;

    const defaultValues: Partial<CarrierFormValues> = {
        companyName: "",
        carrierType: "COMPANY",
        status: "ACTIVE",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        // ... sensible defaults
        ...initialData,
    };

    return (
        <FormPage<CarrierFormValues>
            title={isEdit ? "Edit Carrier" : "Add New Carrier"}
            description={isEdit ? "Update carrier details and settings." : "Create a new carrier profile."}
            backPath={carrierId ? `/carriers/${carrierId}` : "/carriers"}
            schema={carrierSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            submitLabel={isEdit ? "Save Changes" : "Create Carrier"}
        >
            {(form) => (
                <div className="grid gap-6">
                    <FormSection title="Company Information" description="Basic identification details.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Trucking LLC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carrierType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="COMPANY">Company</SelectItem>
                                                <SelectItem value="OWNER_OPERATOR">Owner-Operator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mcNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MC Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dotNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DOT Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Status & Notes">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                <SelectItem value="PREFERRED">Preferred</SelectItem>
                                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                                <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Internal Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add notes about this carrier..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    <FormSection title="Contact Info">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="dispatch@example.com" {...field} />
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
                                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Metropolis" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NY" maxLength={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="zip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ZIP</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10001" maxLength={10} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}
        </FormPage>
    );
}
