import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationList } from './credit-application-list';

const queryClient = new QueryClient();

const meta: Meta<typeof CreditApplicationList> = {
  component: CreditApplicationList,
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
type Story = StoryObj<typeof CreditApplicationList>;

export const AllApplications: Story = {
  args: {},
};

export const PendingOnly: Story = {
  args: {
    status: 'PENDING',
  },
};

export const ApprovedOnly: Story = {
  args: {
    status: 'APPROVED',
  },
};

export const WithSelection: Story = {
  args: {
    onSelect: (id) => console.log('Selected application:', id),
  },
};
