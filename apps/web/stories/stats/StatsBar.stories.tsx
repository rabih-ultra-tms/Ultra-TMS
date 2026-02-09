import type { Meta, StoryObj } from "@storybook/react";
import { StatsBar } from "@/components/tms/stats";
import { StatItem } from "@/components/tms/stats";

const meta: Meta<typeof StatsBar> = {
  title: "Stats/StatsBar",
  component: StatsBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof StatsBar>;

export const DispatchStats: Story = {
  render: () => (
    <StatsBar>
      <StatItem label="Total Loads" value="25" />
      <StatItem label="In Transit" value="8" trend="up" trendLabel="+3" />
      <StatItem label="Unassigned" value="5" trend="down" trendLabel="-2" />
      <StatItem label="At Risk" value="3" trend="up" trendLabel="+1" />
      <StatItem label="Revenue" value="$142,500" trend="up" trendLabel="+12%" />
      <StatItem label="Avg Margin" value="18.5%" />
    </StatsBar>
  ),
};

export const MinimalStats: Story = {
  render: () => (
    <StatsBar>
      <StatItem label="Active" value="12" />
      <StatItem label="Pending" value="3" />
      <StatItem label="Completed" value="45" />
    </StatsBar>
  ),
};
