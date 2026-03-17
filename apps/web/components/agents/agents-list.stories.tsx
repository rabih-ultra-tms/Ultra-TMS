import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentsList } from './agents-list';

const mockAgents = [
  {
    id: '1',
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
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    agentCode: 'AG002',
    companyName: 'Cross Country Carriers',
    contactFirstName: 'Jane',
    contactLastName: 'Smith',
    contactEmail: 'jane@crosscountry.com',
    contactPhone: '+1-555-0124',
    agentType: 'BROKER',
    status: 'ACTIVE',
    tier: 'SILVER',
    territories: ['TX', 'OK', 'AR'],
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-03-14T08:00:00Z',
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    agentCode: 'AG003',
    companyName: 'Midwest Logistics',
    contactFirstName: 'Michael',
    contactLastName: 'Johnson',
    contactEmail: 'michael@midwest.com',
    contactPhone: '+1-555-0125',
    agentType: 'INDEPENDENT_AGENT',
    status: 'PENDING',
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z',
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    agentCode: 'AG004',
    companyName: 'Regional Express',
    contactFirstName: 'Sarah',
    contactLastName: 'Williams',
    contactEmail: 'sarah@regional.com',
    contactPhone: '+1-555-0126',
    agentType: 'CARRIER',
    status: 'SUSPENDED',
    tier: 'BRONZE',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
  },
];

const meta: Meta<typeof AgentsList> = {
  component: AgentsList,
  title: 'Components/Agents/AgentsList',
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
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof AgentsList>;

export const Default: Story = {
  args: {
    tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      agents: mockAgents,
    },
  },
};

export const WithSelection: Story = {
  args: {
    tenantId: 'tenant-1',
    onSelect: (agentId) => {
      console.log('Selected agent:', agentId);
    },
  },
};

export const Empty: Story = {
  args: {
    tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      agents: [],
    },
  },
};

export const Loading: Story = {
  args: {
    tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};
