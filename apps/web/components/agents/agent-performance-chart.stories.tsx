import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentPerformanceChart } from './agent-performance-chart';

const mockPerformance = {
  agentId: 'agent-1',
  totalCommission: 50000,
  totalLoads: 100,
  totalCustomers: 25,
  avgSatisfaction: 4.5,
  status: 'EXCELLENT',
  metricsOverTime: [
    { period: 'Week 1', commission: 10000 },
    { period: 'Week 2', commission: 12000 },
    { period: 'Week 3', commission: 11500 },
    { period: 'Week 4', commission: 16500 },
  ],
};

const meta: Meta<typeof AgentPerformanceChart> = {
  component: AgentPerformanceChart,
  title: 'Components/Agents/AgentPerformanceChart',
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
type Story = StoryObj<typeof AgentPerformanceChart>;

export const Default: Story = {
  args: {
    agentId: 'agent-1',
    period: 'month',
  },
  parameters: {
    mockData: {
      performance: mockPerformance,
    },
  },
};

export const Empty: Story = {
  args: {
    agentId: 'agent-1',
    period: 'month',
  },
  parameters: {
    mockData: {
      performance: null,
    },
  },
};

export const Loading: Story = {
  args: {
    agentId: 'agent-1',
    period: 'month',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};
