import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentPlanTimeline } from './payment-plan-timeline';

const queryClient = new QueryClient();

const meta: Meta<typeof PaymentPlanTimeline> = {
  component: PaymentPlanTimeline,
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
type Story = StoryObj<typeof PaymentPlanTimeline>;

export const Default: Story = {
  args: {
    planId: 'plan-123',
  },
};

export const PartiallyPaid: Story = {
  args: {
    planId: 'plan-partial',
  },
};

export const AllPaid: Story = {
  args: {
    planId: 'plan-complete',
  },
};

export const WithOverdue: Story = {
  args: {
    planId: 'plan-overdue',
  },
};

export const JustStarted: Story = {
  args: {
    planId: 'plan-new',
  },
};
