import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerAssignmentsTable } from './customer-assignments-table';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const nextYear = new Date();
nextYear.setFullYear(nextYear.getFullYear() + 1);

const mockAssignments = [
  {
    id: 'assignment-1',
    agentId: 'agent-1',
    customerId: 'customer-1',
    customerName: 'ABC Manufacturing',
    assignmentType: 'EXCLUSIVE',
    assignmentDate: '2024-01-15T08:00:00Z',
    sunsetDate: null,
    protectionEndDate: null,
    terminatedAt: null,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'assignment-2',
    agentId: 'agent-1',
    customerId: 'customer-2',
    customerName: 'XYZ Logistics',
    assignmentType: 'NON_EXCLUSIVE',
    assignmentDate: '2024-02-01T08:00:00Z',
    sunsetDate: nextYear.toISOString(),
    protectionEndDate: null,
    terminatedAt: null,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'assignment-3',
    agentId: 'agent-1',
    customerId: 'customer-3',
    customerName: 'Tech Services Inc',
    assignmentType: 'PREFERRED',
    assignmentDate: '2024-03-01T08:00:00Z',
    sunsetDate: tomorrow.toISOString(),
    protectionEndDate: null,
    terminatedAt: null,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
];

const meta: Meta<typeof CustomerAssignmentsTable> = {
  component: CustomerAssignmentsTable,
  title: 'Components/Agents/CustomerAssignmentsTable',
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
type Story = StoryObj<typeof CustomerAssignmentsTable>;

export const Default: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      assignments: mockAssignments,
    },
  },
};

export const Empty: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      assignments: [],
    },
  },
};

export const Loading: Story = {
  args: {
    agentId: 'agent-1',
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
};
