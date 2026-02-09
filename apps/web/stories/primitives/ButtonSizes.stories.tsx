import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, MoreVertical, Settings, Download } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "xs", "lg", "icon", "icon-sm", "icon-xs"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Button" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Text Buttons
      </div>
      <div className="flex items-center gap-2">
        <Button size="xs">XS (30px)</Button>
        <Button size="sm">SM (36px)</Button>
        <Button size="default">Default (40px)</Button>
        <Button size="lg">LG (44px)</Button>
      </div>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-2">
        Icon Buttons
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon-xs" variant="ghost">
          <MoreVertical className="size-4" />
        </Button>
        <Button size="icon-sm" variant="ghost">
          <Filter className="size-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  ),
};

export const V5DispatchHeader: Story = {
  render: () => (
    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-2">
      <Button size="xs" variant="default">
        <Plus className="size-3.5 mr-1" />
        New Load
      </Button>
      <Button size="xs" variant="outline">
        <Download className="size-3.5 mr-1" />
        Export
      </Button>
      <div className="w-px h-5 bg-border mx-1" />
      <Button size="icon-sm" variant="ghost">
        <Filter className="size-4" />
      </Button>
      <Button size="icon-sm" variant="ghost">
        <Settings className="size-4" />
      </Button>
      <Button size="icon-sm" variant="ghost">
        <MoreVertical className="size-4" />
      </Button>
    </div>
  ),
};
