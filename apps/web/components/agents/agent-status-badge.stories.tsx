import type { Meta, StoryObj } from '@storybook/react';
import { AgentStatusBadge } from './agent-status-badge';

const meta: Meta<typeof AgentStatusBadge> = {
  component: AgentStatusBadge,
  title: 'Components/Agents/AgentStatusBadge',
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AgentStatusBadge>;

export const Active: Story = {
  args: {
    status: 'ACTIVE',
  },
};

export const Pending: Story = {
  args: {
    status: 'PENDING',
  },
};

export const Suspended: Story = {
  args: {
    status: 'SUSPENDED',
  },
};

export const Terminated: Story = {
  args: {
    status: 'TERMINATED',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-4">
      <AgentStatusBadge status="PENDING" />
      <AgentStatusBadge status="ACTIVE" />
      <AgentStatusBadge status="SUSPENDED" />
      <AgentStatusBadge status="TERMINATED" />
    </div>
  ),
};
