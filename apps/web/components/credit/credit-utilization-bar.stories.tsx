import type { Meta, StoryObj } from '@storybook/react';
import { CreditUtilizationBar } from './credit-utilization-bar';

const meta: Meta<typeof CreditUtilizationBar> = {
  component: CreditUtilizationBar,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CreditUtilizationBar>;

export const Healthy: Story = {
  args: {
    used: 30000,
    limit: 100000,
    threshold: 80000,
  },
};

export const Moderate: Story = {
  args: {
    used: 50000,
    limit: 100000,
    threshold: 80000,
  },
};

export const WithThreshold: Story = {
  args: {
    used: 75000,
    limit: 100000,
    threshold: 80000,
  },
};

export const Warning: Story = {
  args: {
    used: 85000,
    limit: 100000,
    threshold: 80000,
  },
};

export const Critical: Story = {
  args: {
    used: 95000,
    limit: 100000,
    threshold: 80000,
  },
};

export const Exceeded: Story = {
  args: {
    used: 115000,
    limit: 100000,
    threshold: 80000,
  },
};

export const Empty: Story = {
  args: {
    used: 0,
    limit: 100000,
  },
};

export const Full: Story = {
  args: {
    used: 100000,
    limit: 100000,
  },
};
