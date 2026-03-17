import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentCommissionsTable } from './agent-commissions-table';

const mockCommissions = Array.from({ length: 15 }, (_, i) => ({
  id: `commission-${i + 1}`,
  agentId: 'agent-1',
  amount: Math.floor(Math.random() * 10000) + 1000,
  type: ['LOAD_COMMISSION', 'REFERRAL_COMMISSION', 'BONUS'][i % 3],
  status: ['PAID', 'PENDING', 'HELD'][i % 3],
  commissionDate: new Date(2024, 2, (i % 28) + 1).toISOString(),
  createdAt: new Date(2024, 2, (i % 28) + 1).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const meta: Meta<typeof AgentCommissionsTable> = {
  component: AgentCommissionsTable,
  title: 'Components/Agents/AgentCommissionsTable',
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
type Story = StoryObj<typeof AgentCommissionsTable>;

export const Default: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      commissions: mockCommissions,
    },
  },
};

export const Empty: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      commissions: [],
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
