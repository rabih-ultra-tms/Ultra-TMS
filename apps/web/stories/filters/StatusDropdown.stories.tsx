import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StatusDropdown } from "@/components/tms/filters";
import { FilterChip } from "@/components/tms/filters";
import type { StatusOption } from "@/components/tms/filters";

const meta: Meta<typeof StatusDropdown> = {
  title: "Filters/StatusDropdown",
  component: StatusDropdown,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusDropdown>;

const statusOptions: StatusOption[] = [
  { value: "transit", label: "In Transit", color: "transit", count: 8 },
  { value: "unassigned", label: "Unassigned", color: "unassigned", count: 5 },
  { value: "tendered", label: "Tendered", color: "tendered", count: 3 },
  { value: "dispatched", label: "Dispatched", color: "dispatched", count: 4 },
  { value: "delivered", label: "Delivered", color: "delivered", count: 2 },
  { value: "atrisk", label: "At Risk", color: "atrisk", count: 3 },
];

export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState<string[]>(["transit", "atrisk"]);

    return (
      <div className="relative inline-block">
        <FilterChip
          active={selected.length > 0}
          count={selected.length || undefined}
          onClick={() => setOpen(!open)}
        >
          Status
        </FilterChip>
        <StatusDropdown
          options={statusOptions}
          selected={selected}
          onChange={setSelected}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    );
  },
};
