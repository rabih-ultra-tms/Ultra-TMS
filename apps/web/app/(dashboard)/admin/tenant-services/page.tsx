"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared";
import {
  useTenantServices,
  useUpdateTenantService,
} from "@/lib/hooks/operations/use-tenant-services";
import { useHasRole } from "@/lib/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Package,
  Truck,
  DollarSign,
  FileWarning,
  GitCompareArrows,
  FileText,
  type LucideIcon,
} from "lucide-react";

const SERVICE_META: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  customer: {
    label: "Customer",
    description: "Customer details and contact information",
    icon: User,
  },
  route: {
    label: "Route",
    description: "Origin, destination, and route planning",
    icon: MapPin,
  },
  cargo: {
    label: "Cargo",
    description: "Cargo items, dimensions, and weight",
    icon: Package,
  },
  trucks: {
    label: "Trucks",
    description: "Truck selection and load arrangement",
    icon: Truck,
  },
  pricing: {
    label: "Pricing",
    description: "Rate calculation and cost breakdown",
    icon: DollarSign,
  },
  permits: {
    label: "Permits",
    description: "Permit requirements and escort costs",
    icon: FileWarning,
  },
  compare: {
    label: "Compare",
    description: "Side-by-side load plan comparison",
    icon: GitCompareArrows,
  },
  pdf: {
    label: "PDF",
    description: "PDF document generation and export",
    icon: FileText,
  },
};

export default function TenantServicesPage() {
  const isSuperAdmin = useHasRole(["SUPER_ADMIN"]);
  const { data: services, isLoading, error, refetch } = useTenantServices();
  const updateMutation = useUpdateTenantService();

  if (!isSuperAdmin) {
    return (
      <EmptyState
        title="Access Denied"
        description="You need Super Admin privileges to manage tenant services."
      />
    );
  }

  if (isLoading && !services) {
    return <LoadingState message="Loading services..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load services"
        message={error instanceof Error ? error.message : "An error occurred"}
        retry={refetch}
      />
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        title="No services configured"
        description="No tenant services found. Run the database seed to create default services."
      />
    );
  }

  const enabledCount = services.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Services"
        description="Enable or disable Load Planner tabs for your organization"
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">
          {enabledCount} of {services.length} enabled
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => {
          const meta = SERVICE_META[service.serviceKey];
          const Icon = meta?.icon ?? Package;
          const label = meta?.label ?? service.serviceKey;
          const description = meta?.description ?? "";

          return (
            <Card
              key={service.id}
              className={service.enabled ? "" : "opacity-60"}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-md p-2 ${
                        service.enabled
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {label}
                    </CardTitle>
                  </div>
                  <Switch
                    checked={service.enabled}
                    disabled={updateMutation.isPending}
                    onCheckedChange={(checked) => {
                      updateMutation.mutate({
                        serviceKey: service.serviceKey,
                        enabled: checked,
                      });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
