import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "@/components/tms/stats";
import { Truck, DollarSign, Clock, AlertTriangle } from "lucide-react";

const meta: Meta<typeof KpiCard> = {
  title: "Stats/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  argTypes: {
    trend: { control: "select", options: [undefined, "up", "down"] },
  },
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {
  args: {
    icon: <Truck />,
    label: "Active Loads",
    value: "142",
    trend: "up",
    trendLabel: "+12%",
    subtext: "vs. last week",
  },
};

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 max-w-[800px]">
      <KpiCard
        icon={<Truck />}
        label="Active Loads"
        value="142"
        trend="up"
        trendLabel="+12%"
        subtext="vs. last week"
      />
      <KpiCard
        icon={<DollarSign />}
        label="Revenue"
        value="$48.2K"
        trend="up"
        trendLabel="+8.3%"
        subtext="MTD"
      />
      <KpiCard
        icon={<Clock />}
        label="Avg Transit"
        value="2.4d"
        trend="down"
        trendLabel="-0.3d"
        subtext="improving"
      />
      <KpiCard
        icon={<AlertTriangle />}
        label="At Risk"
        value="7"
        trend="up"
        trendLabel="+2"
        subtext="needs attention"
      />
    </div>
  ),
};
