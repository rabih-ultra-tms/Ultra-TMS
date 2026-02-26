"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { OperationsCarrierListItem } from "@/types/carriers";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { Phone, Mail, MapPin, Truck, Users, Shield, AlertTriangle, ShieldCheck, ShieldX, Clock, CheckCircle2, CircleOff, ShieldAlert, Container, Snowflake, Layers, ArrowDownToLine, Zap, Package, Car, Ship } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { CarrierActionsMenu } from "./carrier-actions-menu";
import { TierBadge } from "@/components/carriers/tier-badge";
import type { Intent } from "@/lib/design-tokens";
import { CARRIER_EQUIPMENT_TYPE_LABELS } from "@/types/carriers";

const TYPE_COLORS: Record<string, string> = {
    COMPANY: "bg-purple-100 text-purple-800",
    OWNER_OPERATOR: "bg-orange-100 text-orange-800",
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

type ComplianceState = "compliant" | "expiring" | "expired" | "unknown";

function getComplianceState(carrier: OperationsCarrierListItem): ComplianceState {
  if (!carrier.insuranceExpiryDate) return "unknown";
  const now = new Date();
  const expiry = new Date(carrier.insuranceExpiryDate);
  if (expiry < now) return "expired";
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return "expiring";
  return "compliant";
}
const COMPLIANCE_CONFIG = {
    compliant: { icon: ShieldCheck, label: "Compliant", className: "text-green-600" },
    expiring:  { icon: AlertTriangle, label: "Expiring",  className: "text-amber-600" },
    expired:   { icon: ShieldX,       label: "Expired",   className: "text-red-600"   },
} as const;

const EQUIPMENT_ICON_MAP: Record<string, { icon: React.ElementType; className: string }> = {
    VAN:         { icon: Container,       className: "text-blue-500"   },
    REEFER:      { icon: Snowflake,       className: "text-cyan-500"   },
    FLATBED:     { icon: Layers,          className: "text-amber-600"  },
    STEP_DECK:   { icon: ArrowDownToLine, className: "text-orange-500" },
    POWER_ONLY:  { icon: Zap,            className: "text-yellow-500" },
    BOX_TRUCK:   { icon: Package,        className: "text-slate-500"  },
    SPRINTER:    { icon: Car,            className: "text-purple-500" },
    INTERMODAL:  { icon: Ship,           className: "text-teal-500"   },
    CONESTOGA:   { icon: Truck,          className: "text-gray-500"   },
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
    // ---- Equipment Types ----
    {
        id: "equipment",
        header: "Equipment",
        enableSorting: false,
        cell: ({ row }) => {
            const types = row.original.equipmentTypes ?? [];
            if (types.length === 0) return <span className="text-muted-foreground text-xs">-</span>;

            const visible = types.slice(0, 4);
            const overflow = types.length - 4;
            const allLabels = types
                .map((t) => CARRIER_EQUIPMENT_TYPE_LABELS[t] ?? t)
                .join(", ");

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                                {visible.map((type) => {
                                    const config = EQUIPMENT_ICON_MAP[type];
                                    if (!config) return null;
                                    const Icon = config.icon;
                                    return (
                                        <Icon key={type} className={`h-3.5 w-3.5 shrink-0 ${config.className}`} />
                                    );
                                })}
                                {overflow > 0 && (
                                    <span className="text-[10px] text-muted-foreground font-medium">+{overflow}</span>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">{allLabels}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        size: 100,
    },

    // ---- On-Time % ----
    {
        accessorKey: "onTimeDeliveryRate",
        header: "On-Time",
        enableSorting: true,
        cell: ({ row }) => {
            const rate = row.original.onTimeDeliveryRate;
            if (rate === undefined || rate === null) {
                return <span className="text-muted-foreground text-xs">-</span>;
            }
            const pct = Number(rate);
            const colorClass =
                pct >= 95 ? "text-green-600" : pct >= 85 ? "text-amber-600" : "text-red-600";
            return (
                <span className={`text-xs font-medium ${colorClass}`}>
                    {pct.toFixed(1)}%
                </span>
            );
        },
        size: 80,
    },

    // ---- Total Loads ----
    {
        accessorKey: "totalLoadsCompleted",
        header: "Loads",
        enableSorting: true,
        cell: ({ row }) => {
            const count = row.original.totalLoadsCompleted;
            if (!count) return <span className="text-muted-foreground text-xs">-</span>;
            return <span className="text-xs">{count.toLocaleString()}</span>;
        },
        size: 60,
    },

    // ---- Rating ----
    {
        accessorKey: "avgRating",
        header: "Rating",
        enableSorting: true,
        cell: ({ row }) => {
            const rating = row.original.avgRating;
            if (rating === undefined || rating === null) {
                return <span className="text-muted-foreground text-xs">-</span>;
            }
            return (
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium">{Number(rating).toFixed(1)}</span>
                </div>
            );
        },
        size: 70,
    },

    {
        id: "compliance",
        header: "Compliance",
        cell: ({ row }) => {
            const state = getComplianceState(row.original);

            if (state === "unknown") {
                return <span className="text-muted-foreground text-sm">-</span>;
            }

            const { icon: Icon, label, className } = COMPLIANCE_CONFIG[state];

            return (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${className}`}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{label}</span>
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
            const config: Record<string, { intent?: Intent; label: string }> = {
                PENDING:     { intent: "info",      label: "Pending"     },
                APPROVED:    { intent: "info",      label: "Approved"    },
                ACTIVE:      { intent: "success",   label: "Active"      },
                INACTIVE:    { intent: undefined,   label: "Inactive"    },
                SUSPENDED:   { intent: "warning",   label: "Suspended"   },
                BLACKLISTED: { intent: "danger",    label: "Blacklisted" },
            };
            const { intent, label } = config[status] ?? { intent: "info", label: status };
            return (
                <StatusBadge intent={intent} size="sm">
                    {label}
                </StatusBadge>
            );
        },
    },
    {
        id: "tier",
        header: "Tier",
        cell: ({ row }) => (
            <TierBadge tier={row.original.tier} size="sm" />
        ),
        size: 80,
    },
    {
        id: "actions",
        cell: ({ row }) => <CarrierActionsMenu carrier={row.original} />,
        size: 40,
    },
];
