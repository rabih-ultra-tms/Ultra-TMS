'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/lib/hooks/agents/use-agents';

// ===========================
// Helpers
// ===========================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  PENDING: 'outline',
  SUSPENDED: 'secondary',
  TERMINATED: 'destructive',
};

// ===========================
// Columns
// ===========================

export function getAgentColumns(): ColumnDef<Agent>[] {
  return [
    {
      accessorKey: 'agentCode',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-text-primary">
          {row.original.agentCode}
        </span>
      ),
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-text-primary">
            {row.original.companyName}
          </span>
          {row.original.dbaName && (
            <p className="text-xs text-text-muted line-clamp-1">
              DBA: {row.original.dbaName}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-text-primary">
            {row.original.contactFirstName} {row.original.contactLastName}
          </span>
          <p className="text-xs text-text-muted line-clamp-1">
            {row.original.contactEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'agentType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">
          {row.original.agentType}
        </span>
      ),
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) =>
        row.original.tier ? (
          <Badge variant="outline" className="text-xs">
            {row.original.tier}
          </Badge>
        ) : (
          <span className="text-sm text-text-muted">&mdash;</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? 'outline'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-text-muted">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];
}
