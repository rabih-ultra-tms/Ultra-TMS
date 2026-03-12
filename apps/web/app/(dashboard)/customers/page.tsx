'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { CustomerTable } from '@/components/crm/customers/customer-table';
import { CustomerFilters } from '@/components/crm/customers/customer-filters';
import { useCustomers } from '@/lib/hooks/crm/use-customers';
import { useCRMStore } from '@/lib/stores/crm-store';
import { useDebounce } from '@/lib/hooks';

export default function CustomersPage() {
  const router = useRouter();
  const { customerFilters } = useCRMStore();
  const debouncedSearch = useDebounce(customerFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useCustomers({
    page,
    limit: 20,
    search: debouncedSearch,
    status: customerFilters.status || undefined,
    accountManagerId: customerFilters.accountManagerId || undefined,
  });

  const handleCreate = () => router.push('/customers/new');
  const handleView = (id: string) => router.push(`/customers/${id}`);

  const customers = data?.data || [];
  const activeCount = customers.filter(
    (customer) => customer.status === 'ACTIVE'
  ).length;
  const errorMessage =
    error instanceof Error ? error.message : 'Failed to load customers';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer accounts and relationships"
        actions={
          <>
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
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.pagination?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                customers.filter(
                  (c) =>
                    new Date(c.createdAt).getMonth() ===
                      new Date().getMonth() &&
                    new Date(c.createdAt).getFullYear() ===
                      new Date().getFullYear()
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading customers..." />
      ) : error ? (
        <ErrorState
          title="Failed to load customers"
          message={errorMessage}
          retry={() => refetch()}
        />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          }
        />
      ) : (
        <CustomerTable
          customers={customers}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          onViewContacts={(id) => router.push(`/customers/${id}/contacts`)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
