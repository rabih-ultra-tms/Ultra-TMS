export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PROSPECT" | "SUSPENDED";
export type LeadStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE" | "TASK";

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  status: CustomerStatus;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  billingAddress?: Address;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  primaryContactId?: string;
  primaryContact?: Contact;
  accountManagerId?: string;
  accountManager?: { id: string; name: string };
  paymentTerms?: string;
  creditLimit?: number;
  tags: string[];
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  description?: string;
  stage: LeadStage;
  probability?: number;
  estimatedValue?: number;
  expectedCloseDate?: string;
  companyId: string;
  company?: { id: string; name: string };
  primaryContactId?: string;
  primaryContact?: { id: string; firstName: string; lastName: string };
  ownerId?: string;
  owner?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  customerId?: string;
  contactId?: string;
  leadId?: string;
  scheduledAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
  createdById: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  accountManagerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: LeadStage;
  ownerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
  customerId?: string;
  contactId?: string;
  leadId?: string;
  type?: ActivityType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
