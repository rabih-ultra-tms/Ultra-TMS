import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditLimitCard } from './credit-limit-card';

const queryClient = new QueryClient();

const mockLimit = {
  id: 'limit-123',
  creditLimit: 100000,
  utilized: 45000,
  tenantId: 'tenant-123',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const meta: Meta<typeof CreditLimitCard> = {
  component: CreditLimitCard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="grid gap-4 md:grid-cols-2">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CreditLimitCard>;

export const Healthy: Story = {
  args: {
    limit: mockLimit,
    showUtilization: true,
  },
};

export const HighUtilization: Story = {
  args: {
    limit: {
      ...mockLimit,
      utilized: 85000,
    },
    showUtilization: true,
  },
};

export const AtRisk: Story = {
  args: {
    limit: {
      ...mockLimit,
      utilized: 82000,
    },
    showUtilization: true,
  },
};

export const Exceeded: Story = {
  args: {
    limit: {
      ...mockLimit,
      utilized: 105000,
    },
    showUtilization: true,
  },
};

export const WithoutUtilizationBar: Story = {
  args: {
    limit: mockLimit,
    showUtilization: false,
  },
};
