import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "priority-urgent",
        "priority-high",
        "priority-normal",
        "priority-low",
        "equipment",
        "mode",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { variant: "default", children: "Badge" },
};

export const AllOriginalVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const PriorityBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Priority Levels
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="priority-urgent">Urgent</Badge>
        <Badge variant="priority-high">High</Badge>
        <Badge variant="priority-normal">Normal</Badge>
        <Badge variant="priority-low">Low</Badge>
      </div>
    </div>
  ),
};

export const EquipmentBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Equipment Types
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="equipment">Dry Van</Badge>
        <Badge variant="equipment">Reefer</Badge>
        <Badge variant="equipment">Flatbed</Badge>
        <Badge variant="equipment">Power Only</Badge>
        <Badge variant="equipment">Step Deck</Badge>
      </div>
    </div>
  ),
};

export const ModeBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Transport Modes
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="mode">FTL</Badge>
        <Badge variant="mode">LTL</Badge>
        <Badge variant="mode">Intermodal</Badge>
        <Badge variant="mode">Drayage</Badge>
      </div>
    </div>
  ),
};

export const TableRowExample: Story = {
  render: () => (
    <div className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-md bg-surface w-[500px]">
      <span className="text-xs font-semibold text-primary w-16">LD-2847</span>
      <Badge variant="equipment">Reefer</Badge>
      <Badge variant="mode">FTL</Badge>
      <Badge variant="priority-high">High</Badge>
      <span className="text-xs text-text-secondary ml-auto">42,000 lbs</span>
    </div>
  ),
};
