"use client";

import React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FmcsaLookup } from "@/components/carriers/fmcsa-lookup";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { EQUIPMENT_TYPES, CARRIER_EQUIPMENT_TYPE_LABELS } from "@/types/carriers";


interface CarrierFormProps {
    initialData?: Partial<CarrierFormValues>;
    carrierId?: string; // For back link context
    onSubmit: (data: CarrierFormValues) => Promise<void>;
    isLoading?: boolean;
    isSubmitting?: boolean;
    /** Render function receiving whether the current form type is COMPANY. Sections are rendered outside the <form> element. */
    extraSections?: (isCompany: boolean) => React.ReactNode;
}

export function CarrierForm({
    initialData,
    carrierId,
    onSubmit,
    isLoading,
    isSubmitting,
    extraSections,
}: CarrierFormProps) {
    const isEdit = !!initialData;

    // Strip null values from API response so string defaults ("") are preserved
    const sanitizedData = initialData
        ? Object.fromEntries(Object.entries(initialData).filter(([, v]) => v !== null))
        : {};

    const defaultValues: Partial<CarrierFormValues> = {
        companyName: "",
        carrierType: "COMPANY",
        status: "ACTIVE",
        tier: null,
        email: "",
        phone: "",
        phoneSecondary: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        website: "",
        billingEmail: "",
        factoringCompanyName: "",
        factoringCompanyPhone: "",
        factoringCompanyEmail: "",
        insuranceCompany: "",
        insurancePolicyNumber: "",
        insuranceExpiryDate: "",
        notes: "",
        equipmentTypes: [],
        truckCount: undefined,
        trailerCount: undefined,
        ...sanitizedData,
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
            extraSections={extraSections
                ? (form) => extraSections(form.watch("carrierType") === "COMPANY")
                : undefined
            }
        >
            {(form) => (
                <div className="grid gap-6">
                    {/* FMCSA Verification — auto-fill form fields from lookup */}
                    <FmcsaLookup
                        onAutoFill={(data) => {
                            if (data.companyName) form.setValue("companyName", data.companyName, { shouldDirty: true });
                            if (data.mcNumber) form.setValue("mcNumber", data.mcNumber, { shouldDirty: true });
                            if (data.dotNumber) form.setValue("dotNumber", data.dotNumber, { shouldDirty: true });
                            if (data.address) form.setValue("address", data.address, { shouldDirty: true });
                            if (data.city) form.setValue("city", data.city, { shouldDirty: true });
                            if (data.state) form.setValue("state", data.state, { shouldDirty: true });
                            if (data.zip) form.setValue("zip", data.zip, { shouldDirty: true });
                            if (data.phone) form.setValue("phone", data.phone, { shouldDirty: true });
                        }}
                    />

                    {/* ── Company Information ─────────────────────────────── */}
                    <FormSection title="Company Information" description="Basic identification details.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name *</FormLabel>
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
                                        <FormLabel>Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                            <FormField
                                control={form.control}
                                name="einTaxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>EIN / Tax ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="XX-XXXXXXX" {...field} />
                                        </FormControl>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                            <FormField
                                control={form.control}
                                name="tier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Performance Tier</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="No tier assigned" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">No tier</SelectItem>
                                                <SelectItem value="PLATINUM">Platinum</SelectItem>
                                                <SelectItem value="GOLD">Gold</SelectItem>
                                                <SelectItem value="SILVER">Silver</SelectItem>
                                                <SelectItem value="BRONZE">Bronze</SelectItem>
                                                <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* ── Contact Info ────────────────────────────────────── */}
                    <FormSection title="Contact Info" description="Physical address and contact details.">
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
                                name="phoneSecondary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secondary Phone</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="(555) 987-6543" {...field} />
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
                                            <Input type="url" placeholder="https://example.com" {...field} />
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
                                            <AddressAutocomplete
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                onSelect={(components) => {
                                                    field.onChange(components.address);
                                                    if (components.city) form.setValue("city", components.city, { shouldDirty: true });
                                                    if (components.state) form.setValue("state", components.state, { shouldDirty: true });
                                                    if (components.zip) form.setValue("zip", components.zip, { shouldDirty: true });
                                                }}
                                                placeholder="123 Main St"
                                            />
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

                    {/* ── Billing & Payment ───────────────────────────────── */}
                    <FormSection title="Billing & Payment" description="Payment terms and billing contact.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="billingEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="billing@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredPaymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CHECK">Check</SelectItem>
                                                <SelectItem value="ACH">ACH</SelectItem>
                                                <SelectItem value="WIRE">Wire</SelectItem>
                                                <SelectItem value="QUICK_PAY">Quick Pay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentTermsDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Terms (days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="30"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* ── Factoring ───────────────────────────────────────── */}
                    <FormSection title="Factoring" description="Factoring company details if applicable.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="factoringCompanyName"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Factoring Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABC Factoring Inc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="factoringCompanyPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Factoring Phone</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="factoringCompanyEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Factoring Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="payments@factoring.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* ── Insurance ───────────────────────────────────────── */}
                    <FormSection title="Insurance" description="Carrier insurance details and limits.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="insuranceCompany"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Insurance Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Progressive Commercial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="insurancePolicyNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Policy Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="POL-123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="insuranceExpiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cargoInsuranceLimitCents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo Limit ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="100000"
                                                {...field}
                                                value={field.value !== undefined ? field.value / 100 : ""}
                                                onChange={(e) => {
                                                    const dollars = parseFloat(e.target.value);
                                                    field.onChange(isNaN(dollars) ? undefined : Math.round(dollars * 100));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* ── Equipment & Fleet ──────────────────────────────── */}
                    <FormSection title="Equipment & Fleet" description="Equipment types and fleet size.">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-2">Equipment Types</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {EQUIPMENT_TYPES.map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`eq-${type}`}
                                                checked={(form.watch("equipmentTypes") ?? []).includes(type)}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("equipmentTypes") ?? [];
                                                    form.setValue(
                                                        "equipmentTypes",
                                                        checked
                                                            ? [...current, type]
                                                            : current.filter((t) => t !== type),
                                                        { shouldDirty: true },
                                                    );
                                                }}
                                            />
                                            <label htmlFor={`eq-${type}`} className="text-sm font-normal cursor-pointer select-none">
                                                {CARRIER_EQUIPMENT_TYPE_LABELS[type]}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="truckCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Truck / Tractor Count</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="trailerCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trailer Count</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* ── Notes ───────────────────────────────────────────── */}
                    <FormSection title="Notes">
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
                </div>
            )}
        </FormPage>
    );
}
