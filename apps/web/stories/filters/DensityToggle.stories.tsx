import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DensityToggle, type Density } from "@/components/tms/tables";

const meta: Meta<typeof DensityToggle> = {
  title: "Filters/DensityToggle",
  component: DensityToggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DensityToggle>;

export const Interactive: Story = {
  render: () => {
    const [density, setDensity] = useState<Density>("default");
    return (
      <div className="flex flex-col items-start gap-3">
        <DensityToggle value={density} onChange={setDensity} />
        <span className="text-xs text-text-muted">
          Current: <strong className="text-text-primary">{density}</strong>
        </span>
      </div>
    );
  },
};

export const InToolbar: Story = {
  render: () => {
    const [density, setDensity] = useState<Density>("default");
    return (
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2 w-[500px]">
        <span className="text-xs text-text-secondary">
          Showing 25 of 142 loads
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Density
          </span>
          <DensityToggle value={density} onChange={setDensity} />
        </div>
      </div>
    );
  },
};
