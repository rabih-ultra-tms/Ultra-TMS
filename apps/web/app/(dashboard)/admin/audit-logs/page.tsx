'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { AuditLogTable } from '@/components/admin/audit/audit-log-table';
import { AuditLogFilters } from '@/components/admin/audit/audit-log-filters';
import { useAuditLogs } from '@/lib/hooks/admin/use-audit-logs';
import { useDebounce } from '@/lib/hooks';
import { RefreshCw, Shield, Activity, AlertTriangle } from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [action, setAction] = React.useState('all');
  const [entityType, setEntityType] = React.useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    limit: 25,
    search: debouncedSearch || undefined,
    action: action !== 'all' ? action : undefined,
    entityType: entityType !== 'all' ? entityType : undefined,
  });

  const entries = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.pages || 1;
  const errorMessage =
    error instanceof Error ? error.message : 'Failed to load audit logs';

  const handleReset = () => {
    setSearch('');
    setAction('all');
    setEntityType('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        description="Track and review system activity"
        actions={
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auth Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                entries.filter(
                  (e) => e.action === 'LOGIN' || e.action === 'LOGOUT'
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mutations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                entries.filter((e) =>
                  ['CREATE', 'UPDATE', 'DELETE'].includes(e.action)
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <AuditLogFilters
        search={search}
        action={action}
        entityType={entityType}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onActionChange={(v) => {
          setAction(v);
          setPage(1);
        }}
        onEntityTypeChange={(v) => {
          setEntityType(v);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {isLoading && !data ? (
        <LoadingState message="Loading audit logs..." />
      ) : error ? (
        <ErrorState
          title="Failed to load audit logs"
          message={errorMessage}
          retry={refetch}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description={
            search || action !== 'all' || entityType !== 'all'
              ? 'Try adjusting your filters.'
              : 'Audit log data will appear here as system activity occurs.'
          }
        />
      ) : (
        <>
          <AuditLogTable entries={entries} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of{' '}
                {total} events
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
