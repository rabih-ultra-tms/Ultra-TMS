import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgingBucketChart } from './aging-bucket-chart';

const queryClient = new QueryClient();

const meta: Meta<typeof AgingBucketChart> = {
  component: AgingBucketChart,
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
type Story = StoryObj<typeof AgingBucketChart>;

export const Default: Story = {
  args: {
    tenantId: 'test-tenant',
  },
};

export const HealthyAging: Story = {
  args: {
    tenantId: 'test-tenant-healthy',
  },
};

export const ProblemAging: Story = {
  args: {
    tenantId: 'test-tenant-aging',
  },
};

export const Empty: Story = {
  args: {
    tenantId: 'test-tenant-empty',
  },
};
