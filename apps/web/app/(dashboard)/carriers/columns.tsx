"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OperationsCarrierListItem } from "@/types/carriers";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { Phone, Mail, MapPin, Truck, Users, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CarrierActionsMenu } from "./carrier-actions-menu";

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    PREFERRED: "bg-blue-100 text-blue-800",
    ON_HOLD: "bg-yellow-100 text-yellow-800",
    BLACKLISTED: "bg-red-100 text-red-800",
};

const TYPE_COLORS: Record<string, string> = {
    COMPANY: "bg-purple-100 text-purple-800",
    OWNER_OPERATOR: "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PREFERRED: "Preferred",
    ON_HOLD: "On Hold",
    BLACKLISTED: "Blacklisted",
};

const TYPE_LABELS: Record<string, string> = {
    COMPANY: "Company",
    OWNER_OPERATOR: "Owner-Operator",
};

const isInsuranceExpiring = (carrier: OperationsCarrierListItem) => {
    if (!carrier.insuranceExpiryDate) return false;
    const now = new Date();
    const expiry = new Date(carrier.insuranceExpiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
};

const isInsuranceExpired = (carrier: OperationsCarrierListItem) => {
    if (!carrier.insuranceExpiryDate) return false;
    const now = new Date();
    const expiry = new Date(carrier.insuranceExpiryDate);
    return expiry < now;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

export const columns: ColumnDef<OperationsCarrierListItem>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: "companyName",
        header: "Carrier",
        cell: ({ row }) => {
            const carrier = row.original;
            return (
                <div className="flex flex-col gap-1">
                    <Link
                        href={`/carriers/${carrier.id}`}
                        className="font-medium hover:underline text-primary"
                    >
                        {carrier.companyName || "Unnamed Carrier"}
                    </Link>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[carrier.carrierType] || "bg-gray-100 text-gray-800"}`}>
                            {TYPE_LABELS[carrier.carrierType] || carrier.carrierType}
                        </Badge>
                    </div>
                </div>
            );
        },
    },
    {
        id: "identifiers",
        header: "MC# / DOT#",
        cell: ({ row }) => {
            const { mcNumber, dotNumber } = row.original;
            if (!mcNumber && !dotNumber) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="text-xs space-y-0.5">
                    {mcNumber && <div className="font-mono">MC# {mcNumber}</div>}
                    {dotNumber && <div className="text-muted-foreground font-mono">DOT# {dotNumber}</div>}
                </div>
            );
        },
    },
    {
        id: "location",
        header: "Location",
        cell: ({ row }) => {
            const { city, state } = row.original;
            if (!city || !state) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{city}, {state}</span>
                </div>
            );
        },
    },
    {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
            const { phone, email } = row.original;
            if (!phone && !email) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="space-y-1 text-xs">
                    {phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{phone}</span>
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[140px]" title={email}>{email}</span>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: "stats",
        header: "Fleet",
        cell: ({ row }) => {
            const { _count } = row.original;
            return (
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1" title="Drivers">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{_count?.drivers || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Trucks">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{_count?.trucks || 0}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "insuranceExpiryDate",
        header: "Insurance",
        cell: ({ row }) => {
            const carrier = row.original;
            if (!carrier.insuranceExpiryDate) return <span className="text-muted-foreground">-</span>;

            const expired = isInsuranceExpired(carrier);
            const expiring = isInsuranceExpiring(carrier);

            return (
                <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${expired
                        ? "text-red-600"
                        : expiring
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                >
                    {expired || expiring ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                        <Shield className="h-3.5 w-3.5" />
                    )}
                    {formatDate(carrier.insuranceExpiryDate)}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const config: Record<string, { status?: any; intent?: any; label: string }> = {
                ACTIVE: { intent: "success", label: "Active" },
                INACTIVE: { status: "unassigned", label: "Inactive" },
                PREFERRED: { status: "delivered", label: "Preferred" },
                ON_HOLD: { intent: "warning", label: "On Hold" },
                BLACKLISTED: { intent: "danger", label: "Blacklisted" },
            };
            const { status: s, intent: i, label } = config[status] || { intent: "info", label: status };

            return (
                <StatusBadge status={s} intent={i} size="sm">
                    {label}
                </StatusBadge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CarrierActionsMenu carrier={row.original} />,
        size: 40,
    },
];
