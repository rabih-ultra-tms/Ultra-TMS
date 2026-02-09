import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Timeline, type TimelineEvent } from "@/components/tms/timeline";

// ---------------------------------------------------------------------------
// Timeline stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof Timeline> = {
  title: "Specialized/Timeline",
  component: Timeline,
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const inTransitEvents: TimelineEvent[] = [
  { key: "created", state: "completed", time: "Feb 3, 2:30 PM", description: "Load created" },
  { key: "tendered", state: "completed", time: "Feb 4, 9:15 AM", description: "Tendered to Swift Transport" },
  { key: "accepted", state: "completed", time: "Feb 5, 10:00 AM", description: "Tender accepted" },
  { key: "dispatched", state: "completed", time: "Feb 5, 11:30 AM", description: "Driver Mike Reynolds dispatched" },
  { key: "pickup", state: "completed", time: "Feb 6, 08:00 AM", description: "Picked up at Chicago, IL" },
  { key: "checkpoint", state: "completed", time: "Feb 6, 2:45 PM", description: "GPS checkpoint — on schedule" },
  { key: "transit", state: "current", time: "Now", description: "In transit to Dallas, TX", label: "In Progress", labelIntent: "primary" },
  { key: "arrive", state: "pending", time: "Feb 8, 02:00 PM", description: "Arrive at Dallas, TX" },
  { key: "delivery", state: "pending", time: "Feb 8", description: "Delivery confirmation" },
  { key: "pod", state: "pending", time: "Awaiting", description: "POD upload" },
  { key: "invoice", state: "pending", time: "Awaiting", description: "Invoice generation" },
];

export const InTransit: Story = {
  args: { events: inTransitEvents },
};

const unassignedEvents: TimelineEvent[] = [
  { key: "created", state: "completed", time: "Feb 3, 2:30 PM", description: "Load created" },
  { key: "assign", state: "pending", time: "Awaiting", description: "Carrier assignment" },
  { key: "tender", state: "pending", time: "Awaiting", description: "Tender acceptance" },
  { key: "dispatch", state: "pending", time: "Awaiting", description: "Driver dispatch" },
  { key: "pickup", state: "pending", time: "Awaiting", description: "Pickup" },
  { key: "delivery", state: "pending", time: "Awaiting", description: "Delivery" },
  { key: "pod", state: "pending", time: "Awaiting", description: "POD upload" },
];

export const Unassigned: Story = {
  args: { events: unassignedEvents },
};

const deliveredEvents: TimelineEvent[] = [
  { key: "created", state: "completed", time: "Feb 3, 2:30 PM", description: "Load created" },
  { key: "tendered", state: "completed", time: "Feb 4, 9:15 AM", description: "Tendered to J.B. Hunt" },
  { key: "accepted", state: "completed", time: "Feb 4, 3:00 PM", description: "Tender accepted" },
  { key: "dispatched", state: "completed", time: "Feb 5, 8:00 AM", description: "Driver Carlos Mendez dispatched" },
  { key: "pickup", state: "completed", time: "Feb 6, 11:30 AM", description: "Picked up at Atlanta, GA" },
  { key: "delivery", state: "completed", time: "Feb 7, 06:00 PM", description: "Delivered at Miami, FL" },
  { key: "pod", state: "completed", time: "Feb 7, 4:00 PM", description: "POD uploaded" },
  { key: "invoice", state: "completed", time: "Feb 7, 5:00 PM", description: "Invoice generated" },
];

export const Delivered: Story = {
  args: { events: deliveredEvents },
};

const tenderedEvents: TimelineEvent[] = [
  { key: "created", state: "completed", time: "Feb 3, 2:30 PM", description: "Load created" },
  { key: "tendered", state: "completed", time: "Feb 4, 9:15 AM", description: "Tendered to Werner Logistics" },
  { key: "pending", state: "current", time: "Pending", description: "Awaiting tender acceptance", label: "In Progress", labelIntent: "primary" },
  { key: "dispatch", state: "pending", time: "Awaiting", description: "Driver dispatch" },
  { key: "pickup", state: "pending", time: "Feb 7", description: "Pickup at Los Angeles, CA" },
  { key: "delivery", state: "pending", time: "Feb 7", description: "Delivery at Phoenix, AZ" },
  { key: "pod", state: "pending", time: "Awaiting", description: "POD upload" },
  { key: "invoice", state: "pending", time: "Awaiting", description: "Invoice generation" },
];

export const Tendered: Story = {
  args: { events: tenderedEvents },
};
