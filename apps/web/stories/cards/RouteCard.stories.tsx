import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { RouteCard } from "@/components/tms/cards";

// ---------------------------------------------------------------------------
// RouteCard stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof RouteCard> = {
  title: "Cards/RouteCard",
  component: RouteCard,
};

export default meta;
type Story = StoryObj<typeof RouteCard>;

export const Default: Story = {
  args: {
    origin: {
      city: "Chicago, IL",
      dateTime: "Feb 10, 2026 at 08:00 AM",
    },
    destination: {
      city: "Dallas, TX",
      dateTime: "Feb 12, 2026 at 02:00 PM",
    },
    summary: "920 miles · ~17h drive · $2.72/mi",
  },
};

export const LateDelivery: Story = {
  args: {
    origin: {
      city: "Los Angeles, CA",
      dateTime: "Feb 8, 2026 at 06:00 AM",
    },
    destination: {
      city: "Phoenix, AZ",
      dateTime: "Feb 9, 2026 at 11:00 PM (LATE)",
      isLate: true,
    },
    summary: "373 miles · ~6h drive · $3.10/mi",
  },
};

export const NoSummary: Story = {
  args: {
    origin: {
      city: "Atlanta, GA",
      dateTime: "Feb 15, 2026 at 10:00 AM",
    },
    destination: {
      city: "Miami, FL",
      dateTime: "Feb 16, 2026 at 04:00 PM",
    },
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="w-[380px] space-y-0">
      <RouteCard
        origin={{ city: "New York, NY", dateTime: "Feb 10 at 07:00 AM" }}
        destination={{ city: "Boston, MA", dateTime: "Feb 10 at 03:00 PM" }}
        summary="215 miles · ~4h drive · $4.65/mi"
      />
      <RouteCard
        origin={{ city: "Denver, CO", dateTime: "Feb 11 at 09:00 AM" }}
        destination={{ city: "Salt Lake City, UT", dateTime: "Feb 12 at 12:00 PM" }}
        summary="525 miles · ~8h drive · $2.10/mi"
      />
      <RouteCard
        origin={{ city: "Seattle, WA", dateTime: "Feb 13 at 06:00 AM" }}
        destination={{ city: "Portland, OR", dateTime: "Feb 13 at 10:00 AM", isLate: true }}
        summary="175 miles · ~3h drive · $5.71/mi"
      />
    </div>
  ),
};
