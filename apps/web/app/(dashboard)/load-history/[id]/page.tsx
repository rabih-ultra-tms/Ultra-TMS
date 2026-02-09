'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoadHistoryItem } from '@/lib/hooks/operations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadOverviewSection } from '@/components/loads/load-overview-section';
import { LoadFinancialsSection } from '@/components/loads/load-financials-section';
import {
  LOAD_STATUS_LABELS,
  LOAD_STATUS_COLORS,
  EQUIPMENT_TYPE_LABELS,
} from '@/types/load-history';
import type { LoadHistoryStatus, EquipmentType } from '@/types/load-history';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  ArrowRight,
  DollarSign,
  Package,
  Truck,
  AlertCircle,
  Calendar,
} from 'lucide-react';

function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export default function LoadHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: load, isLoading, error } = useLoadHistoryItem(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <HeaderSkeleton />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Unable to load details</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Load not found'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.refresh()}>
              Retry
            </Button>
            <Button variant="outline" asChild>
              <Link href="/load-history">Back to Load History</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = load.status as LoadHistoryStatus;
  const equipment = load.equipmentTypeUsed as EquipmentType | null;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/load-history" className="hover:text-foreground transition-colors">
          Load History
        </Link>
        <span>/</span>
        <span className="text-foreground">
          {load.quoteNumber || `Load ${id.slice(0, 8)}`}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Route */}
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span>{load.originCity}, {load.originState}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <span>{load.destinationCity}, {load.destinationState}</span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {load.quoteNumber && (
              <span className="font-mono">#{load.quoteNumber}</span>
            )}
            {load.totalMiles && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {load.totalMiles.toLocaleString()} miles
              </span>
            )}
            {equipment && (
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                {EQUIPMENT_TYPE_LABELS[equipment]}
              </span>
            )}
            {load.pickupDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(load.pickupDate)}
              </span>
            )}
          </div>

          {/* Status + financial badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={LOAD_STATUS_COLORS[status]}>
              {LOAD_STATUS_LABELS[status]}
            </Badge>
            {load.customerRateCents != null && (
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(load.customerRateCents)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/load-history">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financials" className="gap-1.5">
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LoadOverviewSection load={load} />
        </TabsContent>

        <TabsContent value="financials">
          <LoadFinancialsSection load={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
