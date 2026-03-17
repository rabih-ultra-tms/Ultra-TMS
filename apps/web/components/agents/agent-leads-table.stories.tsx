import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentLeadsTable } from './agent-leads-table';

const mockLeads = [
  {
    id: 'lead-1',
    agentId: 'agent-1',
    customerId: 'customer-1',
    customerName: 'ABC Manufacturing',
    status: 'NEW',
    loadsCount: 0,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'lead-2',
    agentId: 'agent-1',
    customerId: 'customer-2',
    customerName: 'XYZ Logistics',
    status: 'QUALIFIED',
    loadsCount: 5,
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-12T08:00:00Z',
  },
  {
    id: 'lead-3',
    agentId: 'agent-1',
    customerId: 'customer-3',
    customerName: 'Tech Services Inc',
    status: 'CONVERTED',
    loadsCount: 15,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-03-08T08:00:00Z',
  },
  {
    id: 'lead-4',
    agentId: 'agent-1',
    customerId: 'customer-4',
    customerName: 'Rejected Corp',
    status: 'REJECTED',
    loadsCount: 0,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-03T08:00:00Z',
  },
];

const meta: Meta<typeof AgentLeadsTable> = {
  component: AgentLeadsTable,
  title: 'Components/Agents/AgentLeadsTable',
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
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
type Story = StoryObj<typeof AgentLeadsTable>;

export const Default: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      leads: mockLeads,
    },
  },
};

export const Empty: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      leads: [],
    },
  },
};

export const Loading: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};
