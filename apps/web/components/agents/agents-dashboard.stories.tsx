import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentsDashboard } from './agents-dashboard';

const mockAgents = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  tenantId: 'tenant-1',
  agentCode: `AG${String(i + 1).padStart(3, '0')}`,
  companyName: `Agent Company ${i + 1}`,
  dbaName: i % 2 === 0 ? `DBA Name ${i + 1}` : null,
  contactFirstName: 'John',
  contactLastName: `Agent${i + 1}`,
  contactEmail: `agent${i + 1}@company.com`,
  contactPhone: '+1-555-0100',
  agentType: ['INDEPENDENT_AGENT', 'BROKER', 'CARRIER'][i % 3],
  status: ['ACTIVE', 'PENDING', 'SUSPENDED'][i % 3],
  tier: ['GOLD', 'SILVER', 'BRONZE'][i % 3],
  territories: ['CA', 'TX', 'NY'],
  createdAt: new Date(2024, 0, i + 1).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const mockRankings = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  agentId: String(i + 1),
  agentCode: `AG${String(i + 1).padStart(3, '0')}`,
  companyName: `Top Agent ${i + 1}`,
  contactFirstName: 'John',
  contactLastName: `TopAgent${i + 1}`,
  commission: 50000 - i * 4000,
  loadCount: 100 - i * 5,
  avgCommission: 500 - i * 10,
  totalPaid: 50000 - i * 4000,
  status: 'ACTIVE',
}));

const meta: Meta<typeof AgentsDashboard> = {
  component: AgentsDashboard,
  title: 'Components/Agents/AgentsDashboard',
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
type Story = StoryObj<typeof AgentsDashboard>;

export const Default: Story = {
  args: {
    _tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      agents: mockAgents,
      rankings: mockRankings,
    },
  },
};

export const Loading: Story = {
  args: {
    _tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};

export const NoData: Story = {
  args: {
    _tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      agents: [],
      rankings: [],
    },
  },
};

export const FewAgents: Story = {
  args: {
    _tenantId: 'tenant-1',
  },
  parameters: {
    mockData: {
      agents: mockAgents.slice(0, 3),
      rankings: mockRankings.slice(0, 2),
    },
  },
};
