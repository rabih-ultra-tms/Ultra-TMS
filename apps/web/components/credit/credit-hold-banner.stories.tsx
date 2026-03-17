import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreditHoldBanner } from './credit-hold-banner';

const queryClient = new QueryClient();

const meta: Meta<typeof CreditHoldBanner> = {
  component: CreditHoldBanner,
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
type Story = StoryObj<typeof CreditHoldBanner>;

export const WithActiveFraudHold: Story = {
  args: {
    companyId: 'company-fraud',
  },
};

export const WithPaymentHold: Story = {
  args: {
    companyId: 'company-payment',
  },
};

export const WithComplianceHold: Story = {
  args: {
    companyId: 'company-compliance',
  },
};

export const WithMultipleHolds: Story = {
  args: {
    companyId: 'company-multiple',
  },
};

export const NoHolds: Story = {
  args: {
    companyId: 'company-clean',
  },
};
