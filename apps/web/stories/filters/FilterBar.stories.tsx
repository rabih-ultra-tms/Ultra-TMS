import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  FilterBar,
  FilterDivider,
  FilterChip,
} from "@/components/tms/filters";
import {
  Truck,
  MapPin,
  Calendar,
  Tag,
  AlertTriangle,
  User,
} from "lucide-react";

const meta: Meta<typeof FilterBar> = {
  title: "Filters/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  render: function Render() {
    const [active, setActive] = useState<Set<string>>(new Set());

    function toggle(id: string) {
      setActive((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }

    return (
      <FilterBar
        hasActiveFilters={active.size > 0}
        onClear={() => setActive(new Set())}
      >
        <FilterChip
          icon={<Tag />}
          active={active.has("status")}
          onClick={() => toggle("status")}
          count={active.has("status") ? 3 : undefined}
        >
          Status
        </FilterChip>
        <FilterChip
          icon={<Truck />}
          active={active.has("carrier")}
          onClick={() => toggle("carrier")}
        >
          Carrier
        </FilterChip>
        <FilterChip
          icon={<User />}
          active={active.has("driver")}
          onClick={() => toggle("driver")}
        >
          Driver
        </FilterChip>
        <FilterDivider />
        <FilterChip
          icon={<MapPin />}
          active={active.has("origin")}
          onClick={() => toggle("origin")}
        >
          Origin
        </FilterChip>
        <FilterChip
          icon={<MapPin />}
          active={active.has("dest")}
          onClick={() => toggle("dest")}
        >
          Destination
        </FilterChip>
        <FilterDivider />
        <FilterChip
          icon={<Calendar />}
          active={active.has("pickup")}
          onClick={() => toggle("pickup")}
        >
          Pickup Date
        </FilterChip>
        <FilterChip
          icon={<Calendar />}
          active={active.has("delivery")}
          onClick={() => toggle("delivery")}
        >
          Delivery Date
        </FilterChip>
        <FilterDivider />
        <FilterChip
          icon={<AlertTriangle />}
          active={active.has("atrisk")}
          onClick={() => toggle("atrisk")}
          count={5}
        >
          At Risk
        </FilterChip>
      </FilterBar>
    );
  },
};

export const WithActiveFilters: Story = {
  render: () => (
    <FilterBar hasActiveFilters onClear={() => {}}>
      <FilterChip icon={<Tag />} active count={3}>
        Status
      </FilterChip>
      <FilterChip icon={<Truck />} active count={2}>
        Carrier
      </FilterChip>
      <FilterChip icon={<MapPin />}>Origin</FilterChip>
      <FilterChip icon={<MapPin />}>Destination</FilterChip>
    </FilterBar>
  ),
};
