import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PermitList } from "@/components/tms/documents";

// ---------------------------------------------------------------------------
// PermitList stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof PermitList> = {
  title: "Specialized/PermitList",
  component: PermitList,
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PermitList>;

export const MixedStatuses: Story = {
  args: {
    permits: [
      { key: "oversize", name: "Oversize Permit", expiry: "Exp: Mar 15, 2026", status: "active" },
      { key: "hazmat", name: "Hazmat Endorsement", status: "required" },
      { key: "twic", name: "TWIC Card", expiry: "Exp: Jan 1, 2026", status: "expired" },
      { key: "overweight", name: "Overweight Permit", status: "na" },
    ],
  },
};

export const AllActive: Story = {
  args: {
    permits: [
      { key: "oversize", name: "Oversize Permit", expiry: "Exp: Dec 31, 2026", status: "active" },
      { key: "hazmat", name: "Hazmat Endorsement", expiry: "Exp: Jun 15, 2026", status: "active" },
      { key: "twic", name: "TWIC Card", expiry: "Exp: Sep 30, 2026", status: "active" },
    ],
  },
};

export const AllRequired: Story = {
  args: {
    permits: [
      { key: "oversize", name: "Oversize Permit", status: "required" },
      { key: "hazmat", name: "Hazmat Endorsement", status: "required" },
      { key: "overweight", name: "Overweight Permit", status: "required" },
    ],
  },
};
