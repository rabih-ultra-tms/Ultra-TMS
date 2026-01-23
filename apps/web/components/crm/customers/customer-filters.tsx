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

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <span className="text-sm font-semibold text-foreground">Filters</span>

        <Input
          placeholder="Search companies"
          value={customerFilters.search}
          onChange={(event) => setCustomerFilter("search", event.target.value)}
          className="md:w-72"
        />

        <Select
          value={customerFilters.status || "all"}
          onValueChange={(value) =>
            setCustomerFilter("status", value === "all" ? "" : (value as typeof customerFilters.status))
          }
        >
          <SelectTrigger className="md:w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
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
          className="md:w-56"
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
