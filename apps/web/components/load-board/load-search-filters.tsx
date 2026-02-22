"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LoadPostingSearchFilters } from "@/types/load-board";

const EQUIPMENT_TYPES = [
    "Dry Van",
    "Flatbed",
    "Reefer",
    "Step Deck",
    "Lowboy",
    "Tanker",
    "Power Only",
] as const;

interface LoadSearchFiltersProps {
    filters: LoadPostingSearchFilters;
    onFilterChange: (filters: LoadPostingSearchFilters) => void;
    onClear: () => void;
}

export function LoadSearchFilters({
    filters,
    onFilterChange,
    onClear,
}: LoadSearchFiltersProps) {
    const hasActiveFilters = !!(
        filters.originCity ||
        filters.originState ||
        filters.destCity ||
        filters.destState ||
        filters.equipmentType ||
        filters.pickupDateFrom ||
        filters.pickupDateTo ||
        filters.minRate ||
        filters.maxRate
    );

    function update(partial: Partial<LoadPostingSearchFilters>) {
        onFilterChange({ ...filters, ...partial, page: 1 });
    }

    return (
        <div className="space-y-4 rounded-lg border bg-card p-4">
            {/* Origin row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Origin City
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="City..."
                            value={filters.originCity ?? ""}
                            onChange={(e) =>
                                update({ originCity: e.target.value || undefined })
                            }
                            className="pl-10 h-9"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Origin State
                    </Label>
                    <Input
                        placeholder="IL"
                        maxLength={2}
                        className="uppercase h-9"
                        value={filters.originState ?? ""}
                        onChange={(e) =>
                            update({ originState: e.target.value.toUpperCase() || undefined })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Radius (mi)
                    </Label>
                    <Input
                        type="number"
                        placeholder="50"
                        className="h-9"
                        value={filters.originRadius ?? ""}
                        onChange={(e) =>
                            update({
                                originRadius: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                            })
                        }
                    />
                </div>
            </div>

            {/* Destination row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Dest City
                    </Label>
                    <Input
                        placeholder="City..."
                        className="h-9"
                        value={filters.destCity ?? ""}
                        onChange={(e) =>
                            update({ destCity: e.target.value || undefined })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Dest State
                    </Label>
                    <Input
                        placeholder="NY"
                        maxLength={2}
                        className="uppercase h-9"
                        value={filters.destState ?? ""}
                        onChange={(e) =>
                            update({ destState: e.target.value.toUpperCase() || undefined })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Radius (mi)
                    </Label>
                    <Input
                        type="number"
                        placeholder="50"
                        className="h-9"
                        value={filters.destRadius ?? ""}
                        onChange={(e) =>
                            update({
                                destRadius: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                            })
                        }
                    />
                </div>
            </div>

            {/* Equipment, dates, rate row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Equipment
                    </Label>
                    <Select
                        value={filters.equipmentType ?? "all"}
                        onValueChange={(v) =>
                            update({
                                equipmentType:
                                    v === "all" ? undefined : v,
                            })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {EQUIPMENT_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Pickup From
                    </Label>
                    <Input
                        type="date"
                        className="h-9"
                        value={filters.pickupDateFrom ?? ""}
                        onChange={(e) =>
                            update({
                                pickupDateFrom: e.target.value || undefined,
                            })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Pickup To
                    </Label>
                    <Input
                        type="date"
                        className="h-9"
                        value={filters.pickupDateTo ?? ""}
                        onChange={(e) =>
                            update({
                                pickupDateTo: e.target.value || undefined,
                            })
                        }
                    />
                </div>
                <div className="flex items-end gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-9"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
