import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollectionActivityLog } from './collection-activity-log';

const queryClient = new QueryClient();

const meta: Meta<typeof CollectionActivityLog> = {
  component: CollectionActivityLog,
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
type Story = StoryObj<typeof CollectionActivityLog>;

export const WithActivities: Story = {
  args: {
    _companyId: 'company-123',
  },
};

export const WithPaymentActivity: Story = {
  args: {
    _companyId: 'company-payment',
  },
};

export const WithMultipleActivities: Story = {
  args: {
    _companyId: 'company-active',
  },
};

export const Empty: Story = {
  args: {
    _companyId: 'company-no-activity',
  },
};
