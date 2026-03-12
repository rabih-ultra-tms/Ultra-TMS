'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadStatus } from '@/types/loads';
import {
  Search,
  Plus,
  ListFilter,
  LayoutGrid,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export function LoadsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('fromDate');
    const to = searchParams.get('toDate');
    if (from) {
      return { from: new Date(from), to: to ? new Date(to) : undefined };
    }
    return undefined;
  });

  // Debounce search update (300ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (term: string) => {
    setSearch(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) params.set('search', term);
      else params.delete('search');
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
  };
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    const params = new URLSearchParams(searchParams);
    if (range?.from) {
      params.set('fromDate', format(range.from, 'yyyy-MM-dd'));
      if (range.to) {
        params.set('toDate', format(range.to, 'yyyy-MM-dd'));
      } else {
        params.delete('toDate');
      }
    } else {
      params.delete('fromDate');
      params.delete('toDate');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Preset click handler: applies the right filters per preset
  const handlePresetClick = (preset: (typeof presets)[number]) => {
    const params = new URLSearchParams(searchParams);
    // Clear previous preset-related params
    params.delete('preset');

    if (preset.id === 'unassigned') {
      params.set('status', 'PENDING');
    } else if (preset.id === 'picking_up_today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      params.set('fromDate', today);
      params.set('toDate', today);
      setDateRange({ from: new Date(), to: new Date() });
    } else {
      // Generic preset: pass as ?preset=value for backend/future handling
      params.set('preset', preset.id);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Presets
  const presets = [
    { label: 'My Loads', id: 'my_loads' },
    { label: 'Urgent', id: 'urgent' },
    { label: 'Unassigned', id: 'unassigned' },
    { label: 'Needs Attention', id: 'attention' },
    { label: 'Picking Up Today', id: 'picking_up_today' },
  ];

  const activePresetId = (() => {
    if (searchParams.get('preset')) return searchParams.get('preset');
    if (searchParams.get('status') === 'PENDING' && !searchParams.get('preset'))
      return 'unassigned';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const today = format(new Date(), 'yyyy-MM-dd');
    if (fromDate === today && toDate === today) return 'picking_up_today';
    return null;
  })();

  return (
    <div className="space-y-4 bg-background border-b px-6 py-4">
      {/* Top Row: Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> New Load
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          {/* Filters */}
          <Select onValueChange={(v) => setFilter('status', v)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(LoadStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setFilter('customerId', v)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {/* Mock data */}
              <SelectItem value="cus_1">Walmart</SelectItem>
              <SelectItem value="cus_2">Target</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs justify-start text-left font-normal w-[180px]"
              >
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd')} -{' '}
                        {format(dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd')
                    )
                  ) : (
                    'Pickup Date'
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.replace(pathname)}
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loads..."
              className="pl-8 h-9 text-xs"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background shadow-sm"
            >
              <ListFilter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
          Views:
        </span>
        {presets.map((preset) => (
          <Badge
            key={preset.id}
            variant="secondary"
            className={cn(
              'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors px-3 py-1 font-medium',
              activePresetId === preset.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            )}
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
