"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore } from "@/lib/stores/admin-store";
import { useRoles } from "@/lib/hooks/admin/use-roles";

const statusOptions = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

export function UserFilters() {
  const { userFilters, setUserFilter, resetUserFilters } = useAdminStore();
  const rolesQuery = useRoles();
  const roles = rolesQuery.data?.data || [];

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
      <Input
        placeholder="Search users"
        value={userFilters.search}
        onChange={(event) => setUserFilter("search", event.target.value)}
        className="md:w-72"
      />
      <Select
        value={userFilters.status || "ALL"}
        onValueChange={(value) =>
          setUserFilter("status", value === "ALL" ? "" : (value as typeof userFilters.status))
        }
      >
        <SelectTrigger className="md:w-48">
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
      <Select
        value={userFilters.roleId || "ALL"}
        onValueChange={(value) => setUserFilter("roleId", value === "ALL" ? "" : value)}
        disabled={rolesQuery.isLoading}
      >
        <SelectTrigger className="md:w-52">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.displayName || role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={resetUserFilters}>
        Reset
      </Button>
    </div>
  );
}
