import { z } from "zod";

const addressSchema = z.object({
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const customerFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  legalName: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Valid URL required").optional().or(z.literal("")),
  industry: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  address: addressSchema.optional(),
  logoUrl: z.string().optional(),
});

export const contactFormSchema = z.object({
  companyId: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.length === 0) return true;
      // UUID regex pattern
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    }, {
      message: "Invalid company selected",
    })
    .transform((val) => (val === "" ? undefined : val)) // Convert empty string to undefined
    .optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().refine((val) => val.length > 0, {
    message: "Company is required",
  }).refine((val) => {
    if (val.length === 0) return true;
    // UUID regex pattern
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }, {
    message: "Invalid company selected",
  }),
  description: z.string().optional(),
  stage: z.enum(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  probability: z.number().min(0).max(100).optional(),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.string().optional(),
  ownerId: z.string().optional().refine((val) => {
    if (!val || val.length === 0) return true;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  }, {
    message: "Invalid owner selected",
  }),
});

export const activityFormSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  activityDate: z.string().optional(),
  dueDate: z.string().optional(),
  durationMinutes: z.number().min(0).optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LeadFormData = z.infer<typeof leadFormSchema>;
export type ActivityFormData = z.infer<typeof activityFormSchema>;
export type CustomerFormInput = z.input<typeof customerFormSchema>;
export type ContactFormInput = z.input<typeof contactFormSchema>;
export type LeadFormInput = z.input<typeof leadFormSchema>;
export type ActivityFormInput = z.input<typeof activityFormSchema>;
