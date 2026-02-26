'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Calendar, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgingReport } from '@/components/accounting/aging-report';
import { useAgingReport } from '@/lib/hooks/accounting/use-aging';
import { useCustomers } from '@/lib/hooks/crm/use-customers';
import Link from 'next/link';

export default function AgingReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerId = searchParams.get('customerId') || undefined;
  const asOfDate = searchParams.get('asOfDate') || undefined;

  const [selectedCustomer, setSelectedCustomer] = useState(customerId ?? 'all');
  const [selectedDate, setSelectedDate] = useState(asOfDate ?? '');

  const { data: agingData, isLoading, error, refetch } = useAgingReport({
    customerId,
    asOfDate,
  });

  const { data: customersData } = useCustomers({ limit: 200 });

  const customers = customersData?.data ?? [];

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCustomer && selectedCustomer !== 'all') params.set('customerId', selectedCustomer);
    if (selectedDate) params.set('asOfDate', selectedDate);
    const query = params.toString();
    router.push(query ? `?${query}` : '/accounting/reports/aging');
  };

  const handleClearFilters = () => {
    setSelectedCustomer('all');
    setSelectedDate('');
    router.push('/accounting/reports/aging');
  };

  const hasFilters = !!customerId || !!asOfDate;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/accounting">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Aging Report
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Outstanding receivables by age bucket
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <Filter className="size-4" />
          Filters
        </div>

        <div className="flex-1 min-w-[200px] max-w-[280px]">
          <Label htmlFor="customer-filter" className="mb-1.5 flex items-center gap-1 text-xs text-text-muted">
            <Users className="size-3" />
            Customer
          </Label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger id="customer-filter">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px]">
          <Label htmlFor="asof-date" className="mb-1.5 flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="size-3" />
            As of Date
          </Label>
          <Input
            id="asof-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleApplyFilters}>
            Apply
          </Button>
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Failed to load aging report.{' '}
            <button
              onClick={() => refetch()}
              className="font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </p>
        </div>
      )}

      {/* Report */}
      <AgingReport
        buckets={agingData?.buckets}
        customers={agingData?.customers}
        totalOutstanding={agingData?.totalOutstanding}
        isLoading={isLoading}
      />
    </div>
  );
}
