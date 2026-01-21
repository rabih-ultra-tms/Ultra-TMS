"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/shared";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Track system activity" />
      <EmptyState title="No audit logs" description="Audit log data will appear here." />
    </div>
  );
}
