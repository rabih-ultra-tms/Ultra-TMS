'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';
import { ClaimStatus, ClaimType } from '@/lib/api/claims/types';

export interface ClaimFiltersState {
  search?: string;
  status?: ClaimStatus[];
  claimType?: ClaimType[];
  carrierId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

interface ClaimFiltersProps {
  filters: ClaimFiltersState;
  onFilterChange: (filters: ClaimFiltersState) => void;
  isLoading?: boolean;
}

export function ClaimFilters({
  filters,
  onFilterChange,
  isLoading,
}: ClaimFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, search: value || undefined });
    },
    [filters, onFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        onFilterChange({ ...filters, status: undefined });
      } else {
        onFilterChange({
          ...filters,
          status: [value as ClaimStatus],
        });
      }
    },
    [filters, onFilterChange]
  );

  const handleClaimTypeChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        onFilterChange({ ...filters, claimType: undefined });
      } else {
        onFilterChange({
          ...filters,
          claimType: [value as ClaimType],
        });
      }
    },
    [filters, onFilterChange]
  );

  const handleCarrierIdChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        carrierId: value || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleDateFromChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        dateFrom: value || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleDateToChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        dateTo: value || undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleAmountMinChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        amountMin: value ? parseFloat(value) : undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleAmountMaxChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        amountMax: value ? parseFloat(value) : undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.claimType ||
    filters.carrierId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin ||
    filters.amountMax
  );

  return (
    <Card>
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <Input
            placeholder="Search by claim number or claimant name..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">
              Status
            </label>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={ClaimStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ClaimStatus.SUBMITTED}>Submitted</SelectItem>
                <SelectItem value={ClaimStatus.UNDER_INVESTIGATION}>
                  Under Investigation
                </SelectItem>
                <SelectItem value={ClaimStatus.PENDING_DOCUMENTATION}>
                  Pending Documentation
                </SelectItem>
                <SelectItem value={ClaimStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={ClaimStatus.DENIED}>Denied</SelectItem>
                <SelectItem value={ClaimStatus.SETTLED}>Settled</SelectItem>
                <SelectItem value={ClaimStatus.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">
              Claim Type
            </label>
            <Select
              value={filters.claimType?.[0] || 'all'}
              onValueChange={handleClaimTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={ClaimType.CARGO_DAMAGE}>
                  Cargo Damage
                </SelectItem>
                <SelectItem value={ClaimType.CARGO_LOSS}>Cargo Loss</SelectItem>
                <SelectItem value={ClaimType.SHORTAGE}>Shortage</SelectItem>
                <SelectItem value={ClaimType.LATE_DELIVERY}>
                  Late Delivery
                </SelectItem>
                <SelectItem value={ClaimType.OVERCHARGE}>Overcharge</SelectItem>
                <SelectItem value={ClaimType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">
              Carrier ID
            </label>
            <Input
              placeholder="Enter carrier ID..."
              value={filters.carrierId || ''}
              onChange={(e) => handleCarrierIdChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">
                Date From
              </label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">
                Date To
              </label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">
                Amount Min
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.amountMin || ''}
                onChange={(e) => handleAmountMinChange(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">
                Amount Max
              </label>
              <Input
                type="number"
                placeholder="999999"
                value={filters.amountMax || ''}
                onChange={(e) => handleAmountMaxChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasActiveFilters && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
