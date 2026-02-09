import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "@/components/tms/primitives";

const meta: Meta<typeof SearchInput> = {
  title: "Primitives/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
    shortcut: { control: "text" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: "Search loads...",
    shortcut: "⌘K",
    className: "w-[240px]",
  },
};

export const Small: Story = {
  args: {
    placeholder: "Search...",
    size: "sm",
    className: "w-[200px]",
  },
};

export const WithShortcut: Story = {
  args: {
    placeholder: "Search loads, carriers, orders...",
    shortcut: "⌘K",
    className: "w-[300px]",
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col gap-2">
        <SearchInput
          value={value}
          onValueChange={setValue}
          placeholder="Type to search..."
          shortcut="⌘K"
          className="w-[280px]"
        />
        <span className="text-[11px] text-text-muted">
          Value: &quot;{value}&quot;
        </span>
      </div>
    );
  },
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2 w-[600px]">
      <span className="text-sm font-semibold text-text-primary">
        Dispatch Board
      </span>
      <SearchInput
        placeholder="Search loads..."
        shortcut="⌘K"
        className="w-[240px]"
      />
      <div className="flex gap-1">
        <span className="text-xs text-text-muted">3 actions</span>
      </div>
    </div>
  ),
};
