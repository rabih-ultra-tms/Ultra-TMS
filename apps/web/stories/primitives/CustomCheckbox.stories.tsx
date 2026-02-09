import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CustomCheckbox } from "@/components/tms/primitives";

const meta: Meta<typeof CustomCheckbox> = {
  title: "Primitives/CustomCheckbox",
  component: CustomCheckbox,
  tags: ["autodocs"],
  argTypes: {
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CustomCheckbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { checked: "indeterminate", indeterminate: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { defaultChecked: true, disabled: true },
};

export const Interactive: Story = {
  render: function Render() {
    const [items, setItems] = useState([
      { id: 1, label: "LD-001 — Chicago → Dallas", checked: false },
      { id: 2, label: "LD-002 — Miami → Atlanta", checked: true },
      { id: 3, label: "LD-003 — NYC → Boston", checked: false },
      { id: 4, label: "LD-004 — LA → Phoenix", checked: true },
    ]);

    const allChecked = items.every((i) => i.checked);
    const someChecked = items.some((i) => i.checked) && !allChecked;

    function toggleAll() {
      setItems((prev) => prev.map((i) => ({ ...i, checked: !allChecked })));
    }

    function toggle(id: number) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    }

    return (
      <div className="flex flex-col gap-0 border border-border rounded-md overflow-hidden w-[320px]">
        {/* Header row */}
        <div className="flex items-center gap-3 px-3 py-2 bg-surface-filter border-b border-border">
          <CustomCheckbox
            checked={allChecked ? true : someChecked ? "indeterminate" : false}
            indeterminate={someChecked}
            onCheckedChange={toggleAll}
          />
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Select All
          </span>
        </div>
        {/* Items */}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors cursor-pointer"
            onClick={() => toggle(item.id)}
          >
            <CustomCheckbox
              checked={item.checked}
              onCheckedChange={() => toggle(item.id)}
            />
            <span className="text-xs text-text-primary">{item.label}</span>
          </div>
        ))}
      </div>
    );
  },
};
