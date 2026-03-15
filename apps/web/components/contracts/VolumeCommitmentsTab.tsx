'use client';

import { VolumeCommitment } from '@/lib/api/contracts/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Plus,
  MoreVertical,
  Trash2,
  TrendingUp,
} from 'lucide-react';

interface VolumeCommitmentsTabProps {
  volumeCommitments: VolumeCommitment[];
  contractId: string;
  isLoading: boolean;
}

export default function VolumeCommitmentsTab({
  volumeCommitments,
  isLoading,
}: VolumeCommitmentsTabProps) {
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

  if (!volumeCommitments || volumeCommitments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-4 text-sm text-text-muted">
            No volume commitments have been configured yet
          </p>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Volume Commitment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Volume Commitments</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Add Volume Commitment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {volumeCommitments.map((commitment) => (
            <div
              key={commitment.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-blue-600" />
                  <h4 className="font-semibold text-text-primary">
                    {commitment.commitmentPeriod}
                  </h4>
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  Volume Commitment Period
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-text-muted">Min Volume</p>
                    <p className="mt-1 font-medium">
                      {commitment.minVolume} {commitment.volumeUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Max Volume</p>
                    <p className="mt-1 font-medium">
                      {commitment.maxVolume} {commitment.volumeUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Discount</p>
                    <p className="mt-1 font-medium">
                      {commitment.discountPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Penalty</p>
                    <p className="mt-1 font-medium">
                      {commitment.penaltyPercentage
                        ? `${commitment.penaltyPercentage}%`
                        : '-'}
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
                  <DropdownMenuItem className="gap-2">
                    <BarChart3 className="size-4" />
                    View Performance
                  </DropdownMenuItem>
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
