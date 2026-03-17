import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentDetail } from './agent-detail';

const mockAgent = {
  id: 'agent-1',
  tenantId: 'tenant-1',
  agentCode: 'AG001',
  companyName: 'Premier Transport Solutions',
  dbaName: 'Premier Logistics',
  contactFirstName: 'John',
  contactLastName: 'Doe',
  contactEmail: 'john@premier.com',
  contactPhone: '+1-555-0123',
  agentType: 'INDEPENDENT_AGENT',
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

const mockAgreements = [
  {
    id: 'agreement-1',
    agentId: 'agent-1',
    agreementNumber: 'AGR001',
    effectiveDate: '2024-01-15T08:00:00Z',
    expirationDate: '2025-01-15T08:00:00Z',
    splitType: 'PERCENTAGE',
    splitRate: 80,
    minimumPayout: 5000,
    minimumPerLoad: 50,
    status: 'ACTIVE',
    version: 1,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
];

const mockLeads = [
  {
    id: 'lead-1',
    agentId: 'agent-1',
    customerId: 'customer-1',
    customerName: 'ABC Manufacturing',
    status: 'NEW',
    loadsCount: 5,
    qualifiedAt: null,
    convertedAt: null,
    rejectedAt: null,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'lead-2',
    agentId: 'agent-1',
    customerId: 'customer-2',
    customerName: 'XYZ Logistics',
    status: 'QUALIFIED',
    loadsCount: 12,
    qualifiedAt: '2024-03-12T08:00:00Z',
    convertedAt: null,
    rejectedAt: null,
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-12T08:00:00Z',
  },
];

const meta: Meta<typeof AgentDetail> = {
  component: AgentDetail,
  title: 'Components/Agents/AgentDetail',
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
        },
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
type Story = StoryObj<typeof AgentDetail>;

export const Default: Story = {
  args: {
    agentId: 'agent-1',
    mode: 'view',
  },
  parameters: {
    mockData: {
      agent: mockAgent,
      agreements: mockAgreements,
      leads: mockLeads,
    },
  },
};

export const Loading: Story = {
  args: {
    agentId: 'agent-1',
    mode: 'view',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};

export const NotFound: Story = {
  args: {
    agentId: 'nonexistent',
    mode: 'view',
  },
  parameters: {
    mockData: {
      error: new Error('Agent not found'),
    },
  },
};

export const EditMode: Story = {
  args: {
    agentId: 'agent-1',
    mode: 'edit',
  },
  parameters: {
    mockData: {
      agent: mockAgent,
      agreements: mockAgreements,
      leads: mockLeads,
    },
  },
};
