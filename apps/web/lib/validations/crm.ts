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
});

export const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

export const leadFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  probability: z.number().min(0).max(100),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  ownerId: z.string().optional(),
});

export const activityFormSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  durationMinutes: z.number().min(0).optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LeadFormData = z.infer<typeof leadFormSchema>;
export type ActivityFormData = z.infer<typeof activityFormSchema>;
