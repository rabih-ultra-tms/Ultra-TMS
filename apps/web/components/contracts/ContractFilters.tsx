'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContractStatus, ContractType } from '@/lib/api/contracts/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

interface ContractFiltersProps {
  filters: {
    type?: ContractType;
    status?: ContractStatus[];
    partyId?: string;
    dateRange?: { startDate: string; endDate: string };
  };
  setFilters: (filters: {
    type?: ContractType;
    status?: ContractStatus[];
    partyId?: string;
    dateRange?: { startDate: string; endDate: string };
  }) => void;
}

export default function ContractFilters({
  filters,
  setFilters,
}: ContractFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [partySearch, setPartySearch] = useState('');

  useEffect(() => {
    if (filters.dateRange) {
      setStartDate(filters.dateRange.startDate);
      setEndDate(filters.dateRange.endDate);
    }
  }, [filters.dateRange]);

  const hasActiveFilters = useMemo(() => {
    return (
      localFilters.type ||
      (localFilters.status && localFilters.status.length > 0) ||
      localFilters.partyId ||
      localFilters.dateRange
    );
  }, [localFilters]);

  const handleTypeChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      type: value ? (value as ContractType) : undefined,
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleStatusToggle = (status: ContractStatus) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    const newFilters = {
      ...localFilters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      const newFilters = {
        ...localFilters,
        dateRange: {
          startDate,
          endDate,
        },
      };
      setLocalFilters(newFilters);
      setFilters(newFilters);
    }
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    const newFilters = {
      ...localFilters,
      dateRange: undefined,
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    setFilters({});
    setStartDate('');
    setEndDate('');
    setPartySearch('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* First Row: Type, Status, Party Search */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Contract Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Type
              </label>
              <Select
                value={localFilters.type || ''}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {Object.values(ContractType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Party Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Party Name
              </label>
              <Input
                placeholder="Search party..."
                value={partySearch}
                onChange={(e) => {
                  setPartySearch(e.target.value);
                  // Debounce party search if needed
                }}
                className="w-full"
              />
            </div>

            {/* Date Range Popover */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    {startDate && endDate
                      ? `${format(new Date(startDate), 'MMM dd')} - ${format(new Date(endDate), 'MMM dd')}`
                      : 'Select dates...'}
                    <Calendar className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleDateRangeChange}
                        disabled={!startDate || !endDate}
                      >
                        Apply
                      </Button>
                      {(startDate || endDate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearDateRange}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-1 text-red-600 hover:text-red-700"
                >
                  <X className="size-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Status Checkboxes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ContractStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    localFilters.status?.includes(status)
                      ? 'bg-blue-100 text-blue-800'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
