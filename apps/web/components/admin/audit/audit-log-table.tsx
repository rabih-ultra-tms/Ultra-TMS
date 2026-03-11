import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AuditLogEntry } from '@/lib/types/auth';

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

const ACTION_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  CREATE: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
  LOGIN: 'outline',
  LOGOUT: 'outline',
  EXPORT: 'secondary',
  IMPORT: 'secondary',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead className="hidden md:table-cell">IP Address</TableHead>
            <TableHead className="w-40 text-right">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <Badge variant={ACTION_VARIANTS[entry.action] || 'outline'}>
                  {entry.action}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{entry.userName || 'System'}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.userEmail}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{entry.entityType}</div>
                {entry.entityId && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {entry.entityId.slice(0, 8)}...
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {entry.ipAddress || '—'}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatDate(entry.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
