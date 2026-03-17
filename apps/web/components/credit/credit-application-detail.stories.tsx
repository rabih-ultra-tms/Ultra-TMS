import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationDetail } from './credit-application-detail';

const queryClient = new QueryClient();

const meta: Meta<typeof CreditApplicationDetail> = {
  component: CreditApplicationDetail,
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
type Story = StoryObj<typeof CreditApplicationDetail>;

export const ViewMode: Story = {
  args: {
    applicationId: 'app-123',
    mode: 'view',
  },
};

export const ReviewMode: Story = {
  args: {
    applicationId: 'app-456',
    mode: 'review',
  },
};

export const Pending: Story = {
  args: {
    applicationId: 'app-pending',
    mode: 'review',
  },
};
