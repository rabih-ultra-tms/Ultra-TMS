import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentAgreementCard } from './agent-agreement-card';
import type { AgentAgreement } from '@/lib/hooks/agents';

const mockAgreement: AgentAgreement = {
  id: 'agreement-1',
  agentId: 'agent-1',
  agreementNumber: 'AGR001',
  effectiveDate: '2024-01-15T08:00:00Z',
  expirationDate: '2025-01-15T08:00:00Z',
  splitType: 'PERCENTAGE',
  splitRate: 80,
  minimumPayout: 5000,
  minimumPerLoad: 50,
  drawAmount: 2000,
  drawFrequency: 'WEEKLY',
  status: 'ACTIVE',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-03-15T08:00:00Z',
};

const meta: Meta<typeof AgentAgreementCard> = {
  component: AgentAgreementCard,
  title: 'Components/Agents/AgentAgreementCard',
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
type Story = StoryObj<typeof AgentAgreementCard>;

export const ReadOnly: Story = {
  args: {
    agreement: mockAgreement,
    editable: false,
  },
};

export const Editable: Story = {
  args: {
    agreement: mockAgreement,
    editable: true,
  },
};

export const Inactive: Story = {
  args: {
    agreement: {
      ...mockAgreement,
      id: 'agreement-2',
      status: 'TERMINATED',
    },
    editable: false,
  },
};

export const MinimalData: Story = {
  args: {
    agreement: {
      id: 'agreement-3',
      agentId: 'agent-1',
      agreementNumber: 'AGR003',
      effectiveDate: '2024-03-01T08:00:00Z',
      splitType: 'FLAT_RATE',
      status: 'PENDING',
      createdAt: '2024-03-01T08:00:00Z',
      updatedAt: '2024-03-01T08:00:00Z',
    },
    editable: false,
  },
};
