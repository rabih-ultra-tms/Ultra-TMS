import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentForm } from './agent-form';
import type { Agent } from '@/lib/hooks/agents';

const mockAgent: Agent = {
  id: 'agent-1',
  tenantId: 'tenant-1',
  agentCode: 'AG001',
  companyName: 'Premier Transport Solutions',
  dbaName: 'Premier Logistics',
  contactFirstName: 'John',
  contactLastName: 'Doe',
  contactEmail: 'john@premier.com',
  contactPhone: '+1-555-0123',
  agentType: 'INDEPENDENT',
  status: 'ACTIVE',
  tier: 'GOLD',
  territories: ['CA', 'NV', 'AZ'],
  industryFocus: ['AUTOMOTIVE', 'MACHINERY'],
  legalEntityType: 'LLC',
  taxId: '12-3456789',
  addressLine1: '123 Main Street',
  addressLine2: 'Suite 100',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90001',
  country: 'USA',
  paymentMethod: 'ACH',
  bankName: 'First Bank',
  bankRouting: '123456789',
  bankAccount: '9876543210',
  bankAccountType: 'CHECKING',
  activatedAt: '2024-01-15T08:00:00Z',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-03-15T08:00:00Z',
};

const meta: Meta<typeof AgentForm> = {
  component: AgentForm,
  title: 'Components/Agents/AgentForm',
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <div className="p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof AgentForm>;

export const CreateNew: Story = {
  args: {},
};

export const EditExisting: Story = {
  args: {
    agent: mockAgent,
    onSuccess: () => {
      console.log('Form submission successful');
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    agentId: 'agent-1',
    onSuccess: () => {
      console.log('Agent form submitted successfully');
    },
  },
};
