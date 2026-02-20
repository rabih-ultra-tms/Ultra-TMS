"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCarrier,
  useCarrierDrivers,
  useDeleteCarrier,
} from "@/lib/hooks/operations";
import {
  Building2,
  Shield,
  ShieldCheck,
  FileText,
  Users,
  Pencil,
  Trash2,
  Truck,
  Contact,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailPage } from "@/components/patterns/detail-page";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CarrierOverviewCard } from "@/components/carriers/carrier-overview-card";
import { CarrierInsuranceSection } from "@/components/carriers/carrier-insurance-section";
import { CarrierDocumentsSection } from "@/components/carriers/carrier-documents-section";
import { CarrierDriversSection } from "@/components/carriers/carrier-drivers-section";
import { CarrierLoadsTab } from "@/components/carriers/carrier-loads-tab";
import { CarrierContactsTab } from "@/components/carriers/carrier-contacts-tab";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { CsaScoresDisplay } from "@/components/carriers/csa-scores-display";
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
  const deleteCarrier = useDeleteCarrier(id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteCarrier.mutateAsync(id);
    router.push("/carriers");
  };

  // Tabs definition — matches CARR-002 spec: Overview, Contacts, Insurance, Documents, Drivers, Loads
  const tabs = carrier ? [
    {
      value: "overview",
      label: "Overview",
      icon: Building2,
      content: <CarrierOverviewCard carrier={carrier} />,
    },
    {
      value: "contacts",
      label: "Contacts",
      icon: Contact,
      content: <CarrierContactsTab carrier={carrier} />,
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
    {
      value: "loads",
      label: "Loads",
      icon: Truck,
      content: <CarrierLoadsTab carrierId={id} />,
    },
    {
      value: "compliance",
      label: "Compliance",
      icon: ShieldCheck,
      content: <CsaScoresDisplay carrierId={id} />,
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
    <>
    <DetailPage
      title={carrier?.companyName || "Loading..."}
      subtitle={subtitle}
      tags={statusBadge}
      breadcrumb={breadcrumb}
      backLink="/carriers"
      backLabel="Back to Carriers"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/carriers/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
    />
    <ConfirmDialog
      open={showDeleteDialog}
      title="Delete Carrier"
      description={`Are you sure you want to delete ${carrier?.companyName ?? "this carrier"}? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteDialog(false)}
      isLoading={deleteCarrier.isPending}
    />
    </>
  );
}
