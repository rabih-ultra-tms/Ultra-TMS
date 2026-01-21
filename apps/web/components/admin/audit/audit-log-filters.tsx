"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AuditLogFilters() {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
      <Input placeholder="Search audit logs" className="md:w-72" />
      <Input placeholder="User email" className="md:w-56" />
      <Button variant="outline">Apply</Button>
    </div>
  );
}
