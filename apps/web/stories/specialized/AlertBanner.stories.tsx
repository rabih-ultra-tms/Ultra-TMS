import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { AlertBanner } from "@/components/tms/alerts";

// ---------------------------------------------------------------------------
// AlertBanner stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof AlertBanner> = {
  title: "Specialized/AlertBanner",
  component: AlertBanner,
  decorators: [
    (Story) => (
      <div className="w-[420px] space-y-3">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Danger: Story = {
  args: {
    intent: "danger",
    children: "2 documents require attention. Insurance certificate has expired and POD is pending upload.",
  },
};

export const Warning: Story = {
  args: {
    intent: "warning",
    children: "Carrier insurance expires in 5 days. Contact carrier to renew before expiration.",
  },
};

export const Info: Story = {
  args: {
    intent: "info",
    children: "This load has been flagged for review by dispatch. Check the timeline for updates.",
  },
};

export const Success: Story = {
  args: {
    intent: "success",
    children: "All documents verified and complete. Load is ready for invoicing.",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <AlertBanner intent="danger">
        Critical: Carrier insurance has expired. Load cannot proceed until insurance is renewed.
      </AlertBanner>
      <AlertBanner intent="warning">
        Warning: Delivery is running 2 hours behind schedule. ETA updated to 4:00 PM.
      </AlertBanner>
      <AlertBanner intent="info">
        GPS tracking shows driver is 45 miles from destination. On schedule for delivery.
      </AlertBanner>
      <AlertBanner intent="success">
        All documents verified. Invoice #INV-2026-0142 generated successfully.
      </AlertBanner>
    </div>
  ),
};
