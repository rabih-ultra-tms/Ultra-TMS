import * as z from "zod";

export const carrierSchema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    carrierType: z.enum(["COMPANY", "OWNER_OPERATOR"], {
        message: "Please select a carrier type",
    }),
    mcNumber: z.string().optional(),
    dotNumber: z.string().optional(),
    einTaxId: z.string().optional(),

    // Contact
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    phoneSecondary: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),

    // Billing
    billingEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    paymentTermsDays: z.coerce.number().min(0).optional(),
    preferredPaymentMethod: z.enum(["CHECK", "ACH", "WIRE", "QUICK_PAY"]).optional(),
    factoringCompanyName: z.string().optional(),

    // Insurance
    insuranceCompany: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    insuranceExpiryDate: z.string().optional(),
    insuranceCargoLimitCents: z.coerce.number().min(0).optional(),

    status: z.enum(["ACTIVE", "INACTIVE", "PREFERRED", "ON_HOLD", "BLACKLISTED"]).default("ACTIVE"),
    notes: z.string().optional(),
});

export type CarrierFormValues = z.infer<typeof carrierSchema>;
