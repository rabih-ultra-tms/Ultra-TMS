'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useLoadPlannerQuotes,
  useLoadPlannerQuoteStats,
  useDuplicateLoadPlannerQuote,
  useDeleteLoadPlannerQuote,
} from '@/lib/hooks/operations';
import {
  LoadPlannerQuoteListParams,
  LoadPlannerQuoteListItem,
} from '@/types/load-planner-quotes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Copy, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

export default function LoadPlannerHistoryPage() {
  const router = useRouter();
  const [params, setParams] = useState<LoadPlannerQuoteListParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    pickupState: undefined,
    dropoffState: undefined,
  });

  const { data: listData, isLoading } = useLoadPlannerQuotes(params);
  const { data: stats } = useLoadPlannerQuoteStats();
  const duplicateMutation = useDuplicateLoadPlannerQuote();
  const deleteMutation = useDeleteLoadPlannerQuote();
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const quotes = listData?.data || [];
  const total = listData?.total || 0;
  const totalPages = listData?.totalPages || 0;

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateMutation.mutateAsync(id);
      router.push(`/load-planner/${duplicated.id}/edit`);
    } catch (error) {
      console.error('Failed to duplicate quote:', error);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      if (selectedDeleteId) {
        await deleteMutation.mutateAsync(selectedDeleteId);
        setSelectedDeleteId(null);
      }
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    VIEWED: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Load Planner</h1>
          <p className="text-gray-600">View and manage all load planner quotes</p>
        </div>
        <Button
          onClick={() => router.push('/load-planner/new/edit')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValueCents / 100)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Search quote #, customer..."
              value={params.search || ''}
              onChange={(e) =>
                setParams({ ...params, search: e.target.value, page: 1 })
              }
            />
            <Select
              value={params.status || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  status: value === 'all' ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="VIEWED">Viewed</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Pickup State"
              value={params.pickupState || ''}
              onChange={(e) =>
                setParams({ ...params, pickupState: e.target.value, page: 1 })
              }
            />
            <Input
              placeholder="Dropoff State"
              value={params.dropoffState || ''}
              onChange={(e) =>
                setParams({
                  ...params,
                  dropoffState: e.target.value,
                  page: 1,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No quotes found
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote: LoadPlannerQuoteListItem) => (
                    <TableRow
                      key={quote.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/load-planner/${quote.id}/edit`)}
                    >
                      <TableCell className="font-mono text-sm font-semibold">
                        {quote.quoteNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{quote.customerName}</div>
                        <div className="text-sm text-gray-600">
                          {quote.customerCompany}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {quote.pickupCity}, {quote.pickupState} →{' '}
                        {quote.dropoffCity}, {quote.dropoffState}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(quote.totalCents / 100)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {quote._count.cargoItems} items, {quote._count.trucks}{' '}
                        truck{quote._count.trucks !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/load-planner/${quote.id}/edit`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(quote.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(quote.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {params.page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParams({ ...params, page: params.page - 1 })}
                  disabled={params.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParams({ ...params, page: params.page + 1 })}
                  disabled={params.page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
