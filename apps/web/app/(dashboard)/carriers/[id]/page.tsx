"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCarrier,
  useCarrierDrivers,
} from "@/lib/hooks/operations";
import {
  Building2,
  Shield,
  FileText,
  Users,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailPage } from "@/components/patterns/detail-page";
import { CarrierOverviewCard } from "@/components/carriers/carrier-overview-card";
import { CarrierInsuranceSection } from "@/components/carriers/carrier-insurance-section";
import { CarrierDocumentsSection } from "@/components/carriers/carrier-documents-section";
import { CarrierDriversSection } from "@/components/carriers/carrier-drivers-section";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import type { StatusColorToken, Intent } from "@/lib/design-tokens";

const STATUS_CONFIG: Record<string, { status?: StatusColorToken; intent?: Intent; label: string }> = {
  ACTIVE: { intent: "success", label: "Active" },
  INACTIVE: { status: "unassigned", label: "Inactive" },
  PREFERRED: { status: "delivered", label: "Preferred" },
  ON_HOLD: { intent: "warning", label: "On Hold" },
  BLACKLISTED: { intent: "danger", label: "Blacklisted" },
};

const TYPE_LABELS: Record<string, string> = {
  COMPANY: "Company",
  OWNER_OPERATOR: "Owner-Operator",
};

export default function CarrierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: carrier, isLoading, error, refetch } = useCarrier(id);
  const { data: drivers } = useCarrierDrivers(id);

  // Tabs definition
  const tabs = carrier ? [
    {
      value: "overview",
      label: "Overview",
      icon: Building2,
      content: <CarrierOverviewCard carrier={carrier} />,
    },
    {
      value: "insurance",
      label: "Insurance",
      icon: Shield,
      content: <CarrierInsuranceSection carrier={carrier} />,
    },
    {
      value: "documents",
      label: "Documents",
      icon: FileText,
      content: <CarrierDocumentsSection carrierId={id} />,
    },
    {
      value: "drivers",
      label: "Drivers",
      icon: Users,
      content: (
        <CarrierDriversSection
          carrierId={id}
          drivers={Array.isArray(drivers) ? drivers : []}
        />
      ),
    },
  ] : [];

  // Breadcrumb
  const breadcrumb = (
    <div className="flex items-center gap-1.5">
      <Link href="/carriers" className="hover:text-foreground transition-colors">Carriers</Link>
      <span>&gt;</span>
      <span className="text-foreground font-medium">{carrier?.companyName || "Carrier Details"}</span>
    </div>
  );

  // Status Badge
  const statusConfig = carrier ? (STATUS_CONFIG[carrier.status] || { intent: "info", label: carrier.status }) : null;
  const statusBadge = statusConfig ? (
    <StatusBadge status={statusConfig.status} intent={statusConfig.intent}>
      {statusConfig.label}
    </StatusBadge>
  ) : null;

  // Subtitle parts
  const subtitle = carrier ? (
    <>
      <span>{TYPE_LABELS[carrier.carrierType] || carrier.carrierType}</span>
      {carrier.mcNumber && <span className="mx-1">• MC#{carrier.mcNumber}</span>}
      {carrier.dotNumber && <span className="mx-1">• DOT#{carrier.dotNumber}</span>}
    </>
  ) : null;

  return (
    <DetailPage
      title={carrier?.companyName || "Loading..."}
      subtitle={subtitle}
      tags={statusBadge}
      breadcrumb={breadcrumb}
      backLink="/carriers"
      backLabel="Back to Carriers"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push(`/carriers/${id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
