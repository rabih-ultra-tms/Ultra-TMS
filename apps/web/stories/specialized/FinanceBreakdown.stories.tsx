import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { FinanceBreakdown } from "@/components/tms/finance";

// ---------------------------------------------------------------------------
// FinanceBreakdown stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof FinanceBreakdown> = {
  title: "Specialized/FinanceBreakdown",
  component: FinanceBreakdown,
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FinanceBreakdown>;

export const HighMargin: Story = {
  args: {
    sections: [
      {
        title: "Revenue",
        items: [
          { key: "line-haul", label: "Line Haul", value: "$2,932" },
          { key: "fuel", label: "Fuel Surcharge", value: "$345" },
          { key: "accessorials", label: "Accessorials", value: "$173" },
        ],
        total: { label: "Total Revenue", value: "$3,450" },
      },
      {
        title: "Cost",
        items: [
          { key: "carrier-pay", label: "Carrier Pay", value: "$2,822" },
          { key: "fuel-advance", label: "Fuel Advance", value: "$85" },
        ],
      },
    ],
    margin: { percentage: 18.2, amount: "$628" },
  },
};

export const MediumMargin: Story = {
  args: {
    sections: [
      {
        title: "Revenue",
        items: [
          { key: "line-haul", label: "Line Haul", value: "$2,252" },
          { key: "fuel", label: "Fuel Surcharge", value: "$265" },
          { key: "accessorials", label: "Accessorials", value: "$133" },
        ],
        total: { label: "Total Revenue", value: "$2,650" },
      },
      {
        title: "Cost",
        items: [
          { key: "carrier-pay", label: "Carrier Pay", value: "$2,322" },
          { key: "fuel-advance", label: "Fuel Advance", value: "$70" },
        ],
      },
    ],
    margin: { percentage: 12.4, amount: "$328" },
  },
};

export const LowMargin: Story = {
  args: {
    sections: [
      {
        title: "Revenue",
        items: [
          { key: "line-haul", label: "Line Haul", value: "$1,488" },
          { key: "fuel", label: "Fuel Surcharge", value: "$175" },
          { key: "accessorials", label: "Accessorials", value: "$87" },
        ],
        total: { label: "Total Revenue", value: "$1,750" },
      },
      {
        title: "Cost",
        items: [
          { key: "carrier-pay", label: "Carrier Pay", value: "$1,503" },
          { key: "fuel-advance", label: "Fuel Advance", value: "$45" },
        ],
      },
    ],
    margin: { percentage: 5.8, amount: "$247" },
  },
};

export const NoCarrier: Story = {
  args: {
    sections: [
      {
        title: "Revenue",
        items: [
          { key: "line-haul", label: "Line Haul", value: "$1,870" },
          { key: "fuel", label: "Fuel Surcharge", value: "$220" },
          { key: "accessorials", label: "Accessorials", value: "$110" },
        ],
        total: { label: "Total Revenue", value: "$2,200" },
      },
      {
        title: "Cost",
        items: [
          { key: "carrier-pay", label: "Carrier Pay", value: "\u2014" },
          { key: "fuel-advance", label: "Fuel Advance", value: "\u2014" },
        ],
      },
    ],
    margin: { percentage: 0, amount: "$0" },
  },
};

export const WithPaymentStatus: Story = {
  args: {
    sections: [
      {
        title: "Revenue",
        items: [
          { key: "line-haul", label: "Line Haul", value: "$2,448" },
          { key: "fuel", label: "Fuel Surcharge", value: "$288" },
          { key: "accessorials", label: "Accessorials", value: "$144" },
        ],
        total: { label: "Total Revenue", value: "$2,880" },
      },
      {
        title: "Cost",
        items: [
          { key: "carrier-pay", label: "Carrier Pay", value: "$2,261" },
          { key: "fuel-advance", label: "Fuel Advance", value: "$68" },
        ],
      },
      {
        title: "Payment Status",
        items: [
          { key: "invoice", label: "Invoice Status", value: "Invoiced" },
          { key: "carrier-payment", label: "Carrier Payment", value: "Paid" },
        ],
      },
    ],
    margin: { percentage: 21.5, amount: "$619" },
  },
};
