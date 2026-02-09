import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { FieldList } from "@/components/tms/cards";
import { StatusBadge } from "@/components/tms/primitives";

// ---------------------------------------------------------------------------
// FieldList stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof FieldList> = {
  title: "Cards/FieldList",
  component: FieldList,
};

export default meta;
type Story = StoryObj<typeof FieldList>;

export const CustomerFields: Story = {
  args: {
    fields: [
      { key: "company", label: "Company", value: "Acme Supply Co." },
      { key: "contact", label: "Contact", value: "Operations Dept." },
      { key: "po", label: "PO #", value: "PO-1001-A" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const CarrierDetails: Story = {
  args: {
    fields: [
      { key: "mc", label: "MC Number", value: "MC-456789" },
      { key: "dot", label: "DOT Number", value: "DOT-456789" },
      { key: "rating", label: "Safety Rating", value: "Satisfactory" },
      { key: "insurance", label: "Insurance", value: <StatusBadge intent="success" size="sm">Active</StatusBadge> },
      { key: "authority", label: "Authority", value: "Active" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const LoadSummary: Story = {
  args: {
    fields: [
      { key: "id", label: "Load ID", value: "LD-1001" },
      { key: "status", label: "Status", value: <StatusBadge status="dispatched" size="sm">Dispatched</StatusBadge> },
      { key: "equipment", label: "Equipment", value: "Dry Van 53'" },
      { key: "weight", label: "Weight", value: "42,000 lbs" },
      { key: "miles", label: "Distance", value: "920 miles" },
      { key: "rate", label: "Rate", value: "$2,500.00" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};
