'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormPage, FormSection } from '@/components/patterns/form-page';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAgent, useUpdateAgent } from '@/lib/hooks/agents/use-agents';
import type { Agent } from '@/lib/hooks/agents/use-agents';

// ===========================
// Schema
// ===========================

const agentSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  dbaName: z.string().max(200).optional().or(z.literal('')),
  agentType: z.string().min(1, 'Agent type is required'),
  contactFirstName: z.string().min(1, 'First name is required').max(100),
  contactLastName: z.string().min(1, 'Last name is required').max(100),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().max(20).optional().or(z.literal('')),
  legalEntityType: z.string().optional().or(z.literal('')),
  taxId: z.string().max(20).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional().or(z.literal('')),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(50).optional().or(z.literal('')),
  zip: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  tier: z.string().optional().or(z.literal('')),
  paymentMethod: z.string().optional().or(z.literal('')),
  bankName: z.string().max(200).optional().or(z.literal('')),
  bankRouting: z.string().max(20).optional().or(z.literal('')),
  bankAccount: z.string().max(30).optional().or(z.literal('')),
  bankAccountType: z.string().optional().or(z.literal('')),
});

type AgentFormValues = z.infer<typeof agentSchema>;

// ===========================
// Component
// ===========================

interface AgentFormProps {
  agentId?: string;
  onSuccess?: () => void;
  agent?: Agent;
}

export function AgentForm({
  agentId: _agentId,
  onSuccess,
  agent: initialAgent,
}: AgentFormProps) {
  const router = useRouter();
  const agent = initialAgent;
  const isEditing = !!agent;
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const defaultValues: AgentFormValues = {
    companyName: agent?.companyName ?? '',
    dbaName: agent?.dbaName ?? '',
    agentType: agent?.agentType ?? '',
    contactFirstName: agent?.contactFirstName ?? '',
    contactLastName: agent?.contactLastName ?? '',
    contactEmail: agent?.contactEmail ?? '',
    contactPhone: agent?.contactPhone ?? '',
    legalEntityType: agent?.legalEntityType ?? '',
    taxId: agent?.taxId ?? '',
    addressLine1: agent?.addressLine1 ?? '',
    addressLine2: agent?.addressLine2 ?? '',
    city: agent?.city ?? '',
    state: agent?.state ?? '',
    zip: agent?.zip ?? '',
    country: agent?.country ?? '',
    tier: agent?.tier ?? '',
    paymentMethod: agent?.paymentMethod ?? '',
    bankName: agent?.bankName ?? '',
    bankRouting: agent?.bankRouting ?? '',
    bankAccount: agent?.bankAccount ?? '',
    bankAccountType: agent?.bankAccountType ?? '',
  };

  const handleSubmit = async (values: AgentFormValues) => {
    // Strip empty strings to undefined for optional fields
    const clean = (v: string | undefined): string | undefined =>
      v && v.trim() !== '' ? v.trim() : undefined;

    try {
      if (isEditing) {
        await updateAgent.mutateAsync({
          id: agent.id,
          companyName: values.companyName,
          dbaName: clean(values.dbaName),
          agentType: values.agentType,
          contactFirstName: values.contactFirstName,
          contactLastName: values.contactLastName,
          contactEmail: values.contactEmail,
          contactPhone: clean(values.contactPhone),
          legalEntityType: clean(values.legalEntityType),
          taxId: clean(values.taxId),
          addressLine1: clean(values.addressLine1),
          addressLine2: clean(values.addressLine2),
          city: clean(values.city),
          state: clean(values.state),
          zip: clean(values.zip),
          country: clean(values.country),
          tier: clean(values.tier),
          paymentMethod: clean(values.paymentMethod),
          bankName: clean(values.bankName),
          bankRouting: clean(values.bankRouting),
          bankAccount: clean(values.bankAccount),
          bankAccountType: clean(values.bankAccountType),
        });
        toast.success('Agent updated successfully');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/agents/${agent.id}`);
        }
      } else {
        // Generate a unique agent code from company name + timestamp
        const code =
          values.companyName
            .substring(0, 3)
            .toUpperCase()
            .replace(/[^A-Z]/g, 'X') +
          '-' +
          Date.now().toString(36).toUpperCase().slice(-5);

        const created = await createAgent.mutateAsync({
          agentCode: code,
          companyName: values.companyName,
          dbaName: clean(values.dbaName),
          agentType: values.agentType,
          contactFirstName: values.contactFirstName,
          contactLastName: values.contactLastName,
          contactEmail: values.contactEmail,
          contactPhone: clean(values.contactPhone),
          legalEntityType: clean(values.legalEntityType),
          taxId: clean(values.taxId),
          addressLine1: clean(values.addressLine1),
          addressLine2: clean(values.addressLine2),
          city: clean(values.city),
          state: clean(values.state),
          zip: clean(values.zip),
          country: clean(values.country),
          tier: clean(values.tier),
          paymentMethod: clean(values.paymentMethod),
          bankName: clean(values.bankName),
          bankRouting: clean(values.bankRouting),
          bankAccount: clean(values.bankAccount),
          bankAccountType: clean(values.bankAccountType),
        });
        toast.success('Agent created successfully');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/agents/${created.id}`);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save agent';
      toast.error(message);
    }
  };

  return (
    <FormPage<AgentFormValues>
      title={isEditing ? `Edit Agent: ${agent.companyName}` : 'New Agent'}
      description={
        isEditing
          ? 'Update agent information and settings'
          : 'Register a new agent in the system'
      }
      backPath="/agents"
      schema={agentSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={createAgent.isPending || updateAgent.isPending}
      submitLabel={isEditing ? 'Update Agent' : 'Create Agent'}
    >
      {(form) => (
        <>
          {/* Company Information */}
          <FormSection
            title="Company Information"
            description="Legal entity and business details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Acme Logistics LLC"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dbaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DBA Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doing business as (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDEPENDENT">Independent</SelectItem>
                        <SelectItem value="AGENCY">Agency</SelectItem>
                        <SelectItem value="BROKERAGE">Brokerage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalEntityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Entity Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LLC">LLC</SelectItem>
                        <SelectItem value="CORPORATION">Corporation</SelectItem>
                        <SelectItem value="SOLE_PROPRIETORSHIP">
                          Sole Proprietorship
                        </SelectItem>
                        <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID / EIN</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12-3456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Primary Contact */}
          <FormSection
            title="Primary Contact"
            description="Main point of contact for this agent"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Address */}
          <FormSection title="Address" description="Business mailing address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Suite, unit, etc. (optional)"
                        {...field}
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
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
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
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Banking */}
          <FormSection
            title="Banking"
            description="Payment and banking information for commission payouts"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACH">ACH</SelectItem>
                        <SelectItem value="CHECK">Check</SelectItem>
                        <SelectItem value="WIRE">Wire Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankRouting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Routing number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CHECKING">Checking</SelectItem>
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Settings */}
          <FormSection
            title="Settings"
            description="Agent tier and classification"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRONZE">Bronze</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        </>
      )}
    </FormPage>
  );
}
