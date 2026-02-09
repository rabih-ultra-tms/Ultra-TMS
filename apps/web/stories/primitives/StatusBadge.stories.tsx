import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@/components/tms/primitives";

const meta: Meta<typeof StatusBadge> = {
  title: "Primitives/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        undefined,
        "transit",
        "unassigned",
        "tendered",
        "dispatched",
        "delivered",
        "atrisk",
      ],
    },
    intent: {
      control: "select",
      options: [undefined, "success", "warning", "danger", "info"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    withDot: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

// --- Individual status stories ---

export const InTransit: Story = {
  args: { status: "transit", children: "In Transit" },
};

export const Unassigned: Story = {
  args: { status: "unassigned", children: "Unassigned" },
};

export const Tendered: Story = {
  args: { status: "tendered", children: "Tendered" },
};

export const Dispatched: Story = {
  args: { status: "dispatched", children: "Dispatched" },
};

export const Delivered: Story = {
  args: { status: "delivered", children: "Delivered" },
};

export const AtRisk: Story = {
  args: { status: "atrisk", children: "At Risk" },
};

// --- With dot ---

export const WithDot: Story = {
  args: { status: "transit", children: "In Transit", withDot: true },
};

// --- All statuses grid ---

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
        Load Statuses
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["transit", "In Transit"],
            ["unassigned", "Unassigned"],
            ["tendered", "Tendered"],
            ["dispatched", "Dispatched"],
            ["delivered", "Delivered"],
            ["atrisk", "At Risk"],
          ] as const
        ).map(([status, label]) => (
          <StatusBadge key={status} status={status} withDot>
            {label}
          </StatusBadge>
        ))}
      </div>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-4 mb-1">
        Intent Badges
      </div>
      <div className="flex flex-wrap gap-2">
        {(["success", "warning", "danger", "info"] as const).map((intent) => (
          <StatusBadge key={intent} intent={intent}>
            {intent.charAt(0).toUpperCase() + intent.slice(1)}
          </StatusBadge>
        ))}
      </div>
    </div>
  ),
};

// --- Sizes ---

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusBadge status="transit" size="sm">
        Small
      </StatusBadge>
      <StatusBadge status="transit" size="md">
        Medium
      </StatusBadge>
      <StatusBadge status="transit" size="lg">
        Large
      </StatusBadge>
    </div>
  ),
};
