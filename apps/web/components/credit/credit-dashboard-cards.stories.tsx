import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditDashboardCards } from './credit-dashboard-cards';

const queryClient = new QueryClient();

const meta: Meta<typeof CreditDashboardCards> = {
  component: CreditDashboardCards,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CreditDashboardCards>;

export const Default: Story = {
  args: {
    tenantId: 'test-tenant',
  },
};

export const HighUtilization: Story = {
  args: {
    tenantId: 'test-tenant-high',
  },
};

export const WithActiveHolds: Story = {
  args: {
    tenantId: 'test-tenant-holds',
  },
};

export const EmptyState: Story = {
  args: {
    tenantId: 'test-tenant-empty',
  },
};
