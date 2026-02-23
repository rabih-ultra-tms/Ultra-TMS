"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/types/orders";

export function OrderFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL
    const status =
        (searchParams.get("status") as OrderStatus | "all") || "all";
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    // Helper to update URL
    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "all") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Always reset to page 1 when filtering
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const hasActiveFilters =
        status !== "all" || !!search || !!fromDate || !!toDate;

    const clearFilters = () => {
        router.push("?");
        setSearchValue("");
    };

    const [searchValue, setSearchValue] = React.useState(search);

    // Sync local state with URL param when it changes
    React.useEffect(() => {
        setSearchValue(search);
    }, [search]);

    // Debounce URL update
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== search) {
                updateFilters({ search: searchValue });
            }
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue, search]);

    return (
        <div className="p-4 space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Order #, Customer Ref..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10 h-9"
                />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={status}
                    onValueChange={(value) =>
                        updateFilters({ status: value })
                    }
                >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="QUOTED">Quoted</SelectItem>
                        <SelectItem value="BOOKED">Booked</SelectItem>
                        <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="INVOICED">Invoiced</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) =>
                            updateFilters({ fromDate: e.target.value })
                        }
                        className="w-[130px] h-8 text-xs"
                    />
                    <span>to</span>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) =>
                            updateFilters({ toDate: e.target.value })
                        }
                        className="w-[130px] h-8 text-xs"
                    />
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}
