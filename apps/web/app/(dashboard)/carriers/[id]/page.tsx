'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCarrier, useCarrierDrivers } from '@/lib/hooks/operations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CarrierOverviewCard } from '@/components/carriers/carrier-overview-card';
import { CarrierInsuranceSection } from '@/components/carriers/carrier-insurance-section';
import { CarrierDocumentsSection } from '@/components/carriers/carrier-documents-section';
import { CarrierDriversSection } from '@/components/carriers/carrier-drivers-section';
import {
  ArrowLeft,
  Pencil,
  Building2,
  Shield,
  FileText,
  Users,
  AlertCircle,
} from 'lucide-react';

type CarrierStatus = 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'ON_HOLD' | 'BLACKLISTED';

const STATUS_COLORS: Record<CarrierStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  PREFERRED: 'bg-blue-100 text-blue-800',
  ON_HOLD: 'bg-amber-100 text-amber-800',
  BLACKLISTED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<CarrierStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PREFERRED: 'Preferred',
  ON_HOLD: 'On Hold',
  BLACKLISTED: 'Blacklisted',
};

const TYPE_LABELS: Record<string, string> = {
  COMPANY: 'Company',
  OWNER_OPERATOR: 'Owner Operator',
};

function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
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

export default function CarrierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: carrier, isLoading, error } = useCarrier(id);
  const { data: drivers } = useCarrierDrivers(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <HeaderSkeleton />
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !carrier) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Unable to load carrier details</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Carrier not found'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.refresh()}>
              Retry
            </Button>
            <Button variant="outline" asChild>
              <Link href="/carriers">Back to Carriers</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = carrier.status as CarrierStatus;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/carriers" className="hover:text-foreground transition-colors">
          Carriers
        </Link>
        <span>/</span>
        <span className="text-foreground">{carrier.companyName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-lg">
              {carrier.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{carrier.companyName}</h1>
              <p className="text-sm text-muted-foreground">
                {TYPE_LABELS[carrier.carrierType] || carrier.carrierType}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {carrier.mcNumber && (
              <span className="font-mono">MC-{carrier.mcNumber}</span>
            )}
            {carrier.mcNumber && carrier.dotNumber && <span>|</span>}
            {carrier.dotNumber && (
              <span className="font-mono">DOT# {carrier.dotNumber}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={STATUS_COLORS[status]}>
              {STATUS_LABELS[status]}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/carriers">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/carriers/${id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5">
            <Users className="h-4 w-4" />
            Drivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CarrierOverviewCard carrier={carrier} />
        </TabsContent>

        <TabsContent value="insurance">
          <CarrierInsuranceSection carrier={carrier} />
        </TabsContent>

        <TabsContent value="documents">
          <CarrierDocumentsSection carrierId={id} />
        </TabsContent>

        <TabsContent value="drivers">
          <CarrierDriversSection
            carrierId={id}
            drivers={Array.isArray(drivers) ? drivers : []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
