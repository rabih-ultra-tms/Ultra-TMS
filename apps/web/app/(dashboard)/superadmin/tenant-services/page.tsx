"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared";
import {
  useTenantServicesByTenant,
  useUpdateTenantServiceForTenant,
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
  const { data: tenants, isLoading, error, refetch } = useTenantServicesByTenant();
  const updateMutation = useUpdateTenantServiceForTenant();

  if (!isSuperAdmin) {
    return (
      <EmptyState
        title="Access Denied"
        description="You need Super Admin privileges to manage tenant services."
      />
    );
  }

  if (isLoading && !tenants) {
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

  if (!tenants || tenants.length === 0) {
    return (
      <EmptyState
        title="No services configured"
        description="No tenant services found. Run the database seed to create default services."
      />
    );
  }

  const totalTenants = tenants.length;
  const totalServices = tenants.reduce((count, tenant) => count + tenant.services.length, 0);
  const enabledServices = tenants.reduce(
    (count, tenant) => count + tenant.services.filter((service) => service.enabled).length,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Services"
        description="Enable or disable Load Planner tabs for each tenant"
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">
          {enabledServices} of {totalServices} enabled
        </Badge>
        <Badge variant="outline">{totalTenants} tenants</Badge>
      </div>

      <div className="space-y-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{tenant.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Tenant ID: {tenant.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tenant.status === "ACTIVE" ? "secondary" : "outline"}>
                    {tenant.status}
                  </Badge>
                  <Badge variant="outline">
                    {tenant.services.filter((service) => service.enabled).length} of{" "}
                    {tenant.services.length} enabled
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tenant.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No services configured for this tenant.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tenant.services.map((service) => {
                    const meta = SERVICE_META[service.serviceKey];
                    const Icon = meta?.icon ?? Package;
                    const label = meta?.label ?? service.serviceKey;
                    const description = meta?.description ?? "";

                    return (
                      <div
                        key={service.id}
                        className={`rounded-md border p-3 ${
                          service.enabled ? "" : "opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <div
                              className={`rounded-md p-2 ${
                                service.enabled
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">
                                {description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={service.enabled}
                            disabled={updateMutation.isPending}
                            onCheckedChange={(checked) => {
                              updateMutation.mutate({
                                tenantId: tenant.id,
                                serviceKey: service.serviceKey,
                                enabled: checked,
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
