'use client';

import { SLA } from '@/lib/api/contracts/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';

interface SLAsTabProps {
  slas: SLA[];
  contractId: string;
  isLoading: boolean;
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SLAsTab({
  slas,
  isLoading,
}: SLAsTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!slas || slas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-4 text-sm text-text-muted">
            No SLAs have been configured yet
          </p>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add SLA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Level Agreements</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Add SLA
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slas.map((sla) => (
            <div
              key={sla.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">{sla.name}</h4>
                <p className="mt-1 text-sm text-text-muted">
                  {sla.description}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-text-muted">Delivery Time</p>
                    <p className="mt-1 font-medium">{sla.deliveryTime} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Pickup Time</p>
                    <p className="mt-1 font-medium">{sla.pickupTime} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">On-Time %</p>
                    <p className="mt-1 font-medium">
                      {sla.onTimePercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Penalty/Reward</p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(sla.penalty || sla.reward)}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-red-600">
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
