import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ColumnVisibility } from "@/components/tms/filters";
import { Button } from "@/components/ui/button";
import { Columns3 } from "lucide-react";

const meta: Meta<typeof ColumnVisibility> = {
  title: "Filters/ColumnVisibility",
  component: ColumnVisibility,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ColumnVisibility>;

const columns = [
  { id: "status", label: "Status" },
  { id: "loadId", label: "Load ID" },
  { id: "customer", label: "Customer" },
  { id: "route", label: "Route" },
  { id: "carrier", label: "Carrier" },
  { id: "equipment", label: "Equipment" },
  { id: "pickup", label: "Pickup Date" },
  { id: "delivery", label: "Delivery Date" },
  { id: "rate", label: "Rate" },
  { id: "margin", label: "Margin" },
  { id: "priority", label: "Priority" },
  { id: "mode", label: "Mode" },
];

export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [visible, setVisible] = useState(
      columns.slice(0, 8).map((c) => c.id)
    );

    return (
      <div className="relative inline-block">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setOpen(!open)}
        >
          <Columns3 className="size-4" />
        </Button>
        <ColumnVisibility
          columns={columns}
          visible={visible}
          onChange={setVisible}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    );
  },
};
