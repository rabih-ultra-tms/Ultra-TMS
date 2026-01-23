"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRMStore } from "@/lib/stores/crm-store";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Prospect", value: "PROSPECT" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

export function CustomerFilters() {
  const { customerFilters, setCustomerFilter, resetCustomerFilters } = useCRMStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputSurface = isDark ? "bg-slate-900 text-slate-50" : "bg-white text-slate-900";
  const selectTriggerClass = cn(
    "md:w-52",
    inputSurface,
    "border border-input rounded-md"
  );
  const selectContentClass = cn(
    "border border-border shadow-lg",
    isDark ? "bg-slate-900 text-slate-50" : "bg-white text-slate-900"
  );

  return (
    <div className="rounded-lg border border-border/80 bg-card/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm p-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <span className="text-sm font-semibold text-foreground">Filters</span>

        <Input
          placeholder="Search companies"
          value={customerFilters.search}
          onChange={(event) => setCustomerFilter("search", event.target.value)}
          className={cn("md:w-72", inputSurface)}
        />

        <Select
          value={customerFilters.status || "all"}
          onValueChange={(value) =>
            setCustomerFilter("status", value === "all" ? "" : (value as typeof customerFilters.status))
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Account manager ID"
          value={customerFilters.accountManagerId}
          onChange={(event) => setCustomerFilter("accountManagerId", event.target.value)}
          className={cn("md:w-56", inputSurface)}
        />

        <Button
          variant="outline"
          onClick={resetCustomerFilters}
          className="md:ml-auto"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
