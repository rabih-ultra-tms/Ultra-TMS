import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditLogEntry } from "@/lib/types/auth";

interface AuditLogDetailProps {
  entry: AuditLogEntry;
}

export function AuditLogDetail({ entry }: AuditLogDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>Action: {entry.action}</div>
        <div>User: {entry.userEmail}</div>
        <div>Entity: {entry.entityType}</div>
        <div>Timestamp: {entry.createdAt}</div>
      </CardContent>
    </Card>
  );
}
