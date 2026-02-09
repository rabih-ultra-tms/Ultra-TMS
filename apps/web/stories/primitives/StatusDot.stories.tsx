import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "@/components/tms/primitives";

const meta: Meta<typeof StatusDot> = {
  title: "Primitives/StatusDot",
  component: StatusDot,
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
    pulse: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: { status: "transit" },
};

export const Pulsing: Story = {
  args: { status: "delivered", pulse: true, size: "md" },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Status Colors
      </div>
      <div className="flex items-center gap-4">
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
          <div key={status} className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-2">
        Intent Colors
      </div>
      <div className="flex items-center gap-4">
        {(["success", "warning", "danger", "info"] as const).map((intent) => (
          <div key={intent} className="flex items-center gap-2">
            <StatusDot intent={intent} />
            <span className="text-xs text-text-secondary capitalize">
              {intent}
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-2">
        Sizes
      </div>
      <div className="flex items-center gap-4">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex items-center gap-2">
            <StatusDot status="transit" size={size} />
            <span className="text-xs text-text-secondary">{size}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-2">
        Pulse Animation
      </div>
      <div className="flex items-center gap-4">
        <StatusDot intent="success" pulse size="md" />
        <span className="text-xs text-text-muted">Live indicator</span>
      </div>
    </div>
  ),
};
