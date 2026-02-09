import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { InfoGrid } from "@/components/tms/cards";
import { StatusBadge } from "@/components/tms/primitives";

// ---------------------------------------------------------------------------
// InfoGrid stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof InfoGrid> = {
  title: "Cards/InfoGrid",
  component: InfoGrid,
};

export default meta;
type Story = StoryObj<typeof InfoGrid>;

export const TwoColumn: Story = {
  args: {
    cells: [
      { key: "type", label: "Type", value: "Dry Van" },
      { key: "temp", label: "Temp Control", value: "N/A" },
      { key: "weight", label: "Weight", value: "42,000 lbs", subText: "Full load" },
      { key: "dims", label: "Dimensions", value: "53' standard" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export const ThreeColumn: Story = {
  args: {
    columns: 3,
    cells: [
      { key: "rate", label: "Customer Rate", value: "$2,500.00" },
      { key: "pay", label: "Carrier Pay", value: "$1,800.00" },
      { key: "margin", label: "Margin", value: "28.0%", subText: "$700.00" },
      { key: "rpm", label: "Rate/Mile", value: "$2.72" },
      { key: "cpm", label: "Cost/Mile", value: "$1.96" },
      { key: "status", label: "Payment", value: "Pending" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export const WithReactNodeValues: Story = {
  args: {
    cells: [
      { key: "status", label: "Status", value: <StatusBadge status="transit" size="sm">In Transit</StatusBadge> },
      { key: "priority", label: "Priority", value: <StatusBadge intent="danger" size="sm">Urgent</StatusBadge> },
      { key: "carrier", label: "Carrier", value: "Swift Transport" },
      { key: "driver", label: "Driver", value: "John Smith", subText: "(555) 123-4567" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export const SingleColumn: Story = {
  args: {
    columns: 1,
    cells: [
      { key: "company", label: "Company", value: "Acme Supply Co." },
      { key: "address", label: "Address", value: "123 Main St, Chicago, IL 60601" },
      { key: "contact", label: "Contact", value: "Jane Doe", subText: "Operations Manager" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};
