"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettlementStatus } from "@/lib/hooks/accounting/use-settlements";

const STATUS_OPTIONS: { value: SettlementStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "APPROVED", label: "Approved" },
  { value: "PROCESSED", label: "Processed" },
  { value: "PAID", label: "Paid" },
];

export function SettlementFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status =
    (searchParams.get("status") as SettlementStatus | "all") || "all";
  const search = searchParams.get("search") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters =
    status !== "all" || !!search || !!fromDate || !!toDate;

  const [searchValue, setSearchValue] = React.useState(search);

  React.useEffect(() => {
    setSearchValue(search);
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        updateFilters({ search: searchValue });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const clearFilters = () => {
    router.push("?");
    setSearchValue("");
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by settlement #, carrier..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9 pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onValueChange={(value) => updateFilters({ status: value })}
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => updateFilters({ fromDate: e.target.value })}
            className="h-9 w-[140px]"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => updateFilters({ toDate: e.target.value })}
            className="h-9 w-[140px]"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
