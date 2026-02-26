import * as z from "zod";

// Optional string: accepts string | null | undefined, normalizes to ""
const optStr = z.preprocess((v) => v ?? "", z.string());

// Optional email: validates format when non-empty, accepts null/undefined/""
const optEmail = z.preprocess(
    (v) => v ?? "",
    z.string().email("Invalid email address").or(z.literal(""))
);

// Optional URL: validates format when non-empty, accepts null/undefined/""
const optUrl = z.preprocess(
    (v) => v ?? "",
    z.string().url("Invalid URL").or(z.literal(""))
);

// Optional non-negative integer: accepts "", null, undefined as absent
const optPosInt = z.preprocess(
    (v) => (v === "" || v === null || v === undefined) ? undefined : Number(v),
    z.number().int().min(0).optional()
);

// Optional non-negative number: same as above for decimal fields
const optPosNum = z.preprocess(
    (v) => (v === "" || v === null || v === undefined) ? undefined : Number(v),
    z.number().min(0).optional()
);

export const carrierSchema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    carrierType: z.enum(["COMPANY", "OWNER_OPERATOR"], {
        message: "Please select a carrier type",
    }),
    mcNumber: optStr,
    dotNumber: optStr,
    einTaxId: optStr,

    // Contact
    address: optStr,
    city: optStr,
    state: optStr,
    zip: optStr,
    phone: optStr,
    phoneSecondary: optStr,
    email: optEmail,
    website: optUrl,

    // Billing
    billingEmail: optEmail,
    paymentTermsDays: optPosNum,
    preferredPaymentMethod: z.enum(["CHECK", "ACH", "WIRE", "QUICK_PAY"]).optional(),

    // Factoring
    factoringCompanyName: optStr,
    factoringCompanyPhone: optStr,
    factoringCompanyEmail: optEmail,

    // Insurance
    insuranceCompany: optStr,
    insurancePolicyNumber: optStr,
    insuranceExpiryDate: optStr,
    cargoInsuranceLimitCents: optPosNum,

    status: z.enum(["PENDING", "APPROVED", "ACTIVE", "INACTIVE", "SUSPENDED", "BLACKLISTED"]).default("ACTIVE"),
    notes: optStr,
    tier: z.string().optional().nullable(),
    equipmentTypes: z.array(z.string()).optional(),
    truckCount: optPosInt,
    trailerCount: optPosInt,
});

export type CarrierFormValues = z.infer<typeof carrierSchema>;
