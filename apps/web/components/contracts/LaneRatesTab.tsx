'use client';

import { useEffect, useState } from 'react';
import { RateTable, RateLane } from '@/lib/api/contracts/types';
import { rateLanesApi } from '@/lib/api/contracts/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface LaneRatesTabProps {
  rateTables: RateTable[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function LaneRatesTab({ rateTables }: LaneRatesTabProps) {
  const [lanes, setLanes] = useState<{ tableId: string; lanes: RateLane[] }[]>(
    []
  );
  const [loadingTables, setLoadingTables] = useState<Set<string>>(new Set());
  const [deletingLanes, setDeletingLanes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadLanes = async () => {
      if (!rateTables || rateTables.length === 0) return;

      const newLoadingTables = new Set(
        rateTables.map((t) => t.id)
      );
      setLoadingTables(newLoadingTables);

      try {
        const lanesData = await Promise.all(
          rateTables.map(async (table) => {
            const tableLanes = await rateLanesApi.listForTable(table.id);
            return { tableId: table.id, lanes: tableLanes };
          })
        );
        setLanes(lanesData);
      } catch (_error) {
        toast.error('Failed to load lanes');
      } finally {
        setLoadingTables(new Set());
      }
    };

    loadLanes();
  }, [rateTables]);

  const handleDeleteLane = async (tableId: string, laneId: string) => {
    try {
      setDeletingLanes((prev) => new Set(prev).add(laneId));
      await rateLanesApi.delete(tableId, laneId);
      setLanes((prev) =>
        prev.map((item) =>
          item.tableId === tableId
            ? {
                ...item,
                lanes: item.lanes.filter((l) => l.id !== laneId),
              }
            : item
        )
      );
      toast.success('Lane deleted successfully');
    } catch (_error) {
      toast.error('Failed to delete lane');
    } finally {
      setDeletingLanes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(laneId);
        return newSet;
      });
    }
  };

  if (!rateTables || rateTables.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-text-muted">
            No rate tables available to display lanes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {rateTables.map((table) => {
        const tableLanes = lanes.find((item) => item.tableId === table.id);
        const isLoading = loadingTables.has(table.id);

        return (
          <Card key={table.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{table.name} - Lanes</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Add Lane
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !tableLanes?.lanes || tableLanes.lanes.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">
                  No lanes configured for this rate table
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead className="text-right">Base Rate</TableHead>
                      <TableHead className="text-right">Markup</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Min Charge</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableLanes.lanes.map((lane) => (
                      <TableRow key={lane.id}>
                        <TableCell>{lane.origin}</TableCell>
                        <TableCell>{lane.destination}</TableCell>
                        <TableCell>{lane.weight || '-'}</TableCell>
                        <TableCell>{lane.distance || '-'}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(lane.baseRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {lane.markup ? `${lane.markup}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {lane.discount ? `${lane.discount}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {lane.minCharge
                            ? formatCurrency(lane.minCharge)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteLane(table.id, lane.id)
                                }
                                disabled={deletingLanes.has(lane.id)}
                                className="gap-2 text-red-600"
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
