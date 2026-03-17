import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditApplicationForm } from './credit-application-form';

const queryClient = new QueryClient();

const meta: Meta<typeof CreditApplicationForm> = {
  component: CreditApplicationForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="flex justify-center p-8">
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
type Story = StoryObj<typeof CreditApplicationForm>;

export const Default: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    companyId: 'company-123',
  },
};

export const WithSuccessCallback: Story = {
  args: {
    onSuccess: () => console.log('Application submitted successfully'),
  },
};

export const MultiStep: Story = {
  args: {
    onSuccess: () => {},
  },
};
