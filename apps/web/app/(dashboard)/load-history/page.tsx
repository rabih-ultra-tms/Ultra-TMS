'use client';

import { useState } from 'react';
import {
  useLoadHistory,
  useLoadHistoryStats,
  useLaneStats,
} from '@/lib/hooks/operations';
import {
  LoadHistory,
  LoadHistoryListParams,
  LaneStats,
} from '@/types/load-history';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { formatCurrency } from '@/lib/utils/format';

const statusColors: Record<string, string> = {
  BOOKED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const marginStatusClass = (percentage: number) => {
  if (percentage >= 30) return 'text-green-600 bg-green-50';
  if (percentage >= 20) return 'text-blue-600 bg-blue-50';
  if (percentage >= 10) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export default function LoadHistoryPage() {
  const [params, setParams] = useState<LoadHistoryListParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    originState: undefined,
    destinationState: undefined,
    carrierId: undefined,
  });

  const [selectedLane, setSelectedLane] = useState<{
    origin: string;
    destination: string;
  } | null>(null);

  const { data: listData, isLoading } = useLoadHistory(params);
  const { data: stats } = useLoadHistoryStats();
  const { data: laneStats } = useLaneStats(
    selectedLane?.origin || '',
    selectedLane?.destination || ''
  );

  const loads = listData?.data || [];
  const total = listData?.total || 0;
  const totalPages = listData?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Load History</h1>
        <p className="text-gray-600">Track completed loads and profitability metrics</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Loads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedLoads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenueCents / 100)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalCostCents / 100)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalMarginCents / 100)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lane Stats Panel */}
      {selectedLane && laneStats && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">
              Lane Stats: {selectedLane.origin} → {selectedLane.destination}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLane(null)}
                className="float-right"
              >
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-600">Total Loads</div>
                <div className="text-lg font-semibold">{laneStats.count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg Customer Rate</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(laneStats.avgRevenueCents / 100)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg Carrier Cost</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(laneStats.avgCostCents / 100)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg Margin</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(laneStats.avgMarginCents / 100)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Input
              placeholder="Origin State"
              value={params.originState || ''}
              onChange={(e) =>
                setParams({ ...params, originState: e.target.value, page: 1 })
              }
            />
            <Input
              placeholder="Destination State"
              value={params.destinationState || ''}
              onChange={(e) =>
                setParams({
                  ...params,
                  destinationState: e.target.value,
                  page: 1,
                })
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
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loads ({total})</CardTitle>
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
                  <TableHead>Cust. Rate</TableHead>
                  <TableHead>Carrier Cost</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Pickup Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : loads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No loads found
                    </TableCell>
                  </TableRow>
                ) : (
                  loads.map((load: LoadHistory) => (
                    <TableRow key={load.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-semibold">
                        {load.quoteNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{load.customerName}</div>
                        {load.customerCompany && (
                          <div className="text-sm text-gray-600">
                            {load.customerCompany}
                          </div>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-sm cursor-pointer hover:underline"
                        onClick={() =>
                          setSelectedLane({
                            origin: load.originState,
                            destination: load.destinationState,
                          })
                        }
                      >
                        {load.originCity}, {load.originState} →{' '}
                        {load.destinationCity}, {load.destinationState}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[load.status]}>
                          {load.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(load.customerRateCents / 100)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(load.carrierRateCents / 100)}
                      </TableCell>
                      <TableCell>
                        <div className={`px-2 py-1 rounded font-semibold text-sm ${marginStatusClass(load.marginPercentage)}`}>
                          {formatCurrency(load.marginCents / 100)}
                          <span className="ml-1 text-xs opacity-80">
                            ({load.marginPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {load.pickupDate
                          ? new Date(load.pickupDate).toLocaleDateString()
                          : '-'}
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
