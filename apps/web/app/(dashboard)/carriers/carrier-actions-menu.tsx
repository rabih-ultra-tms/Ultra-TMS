"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2, Ban, CheckSquare, Pause, CircleOff, ShieldX, ShieldCheck } from "lucide-react";
import { OperationsCarrierListItem } from "@/types/carriers";
import { useDeleteCarrier, useUpdateCarrier } from "@/lib/hooks/operations";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface CarrierActionsMenuProps {
    carrier: OperationsCarrierListItem;
}

export function CarrierActionsMenu({ carrier }: CarrierActionsMenuProps) {
    const router = useRouter();
    const deleteMutation = useDeleteCarrier();
    const updateMutation = useUpdateCarrier();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    // Status helpers
    const isPending    = carrier.status === "PENDING" || carrier.status === "APPROVED";
    const isActive     = carrier.status === "ACTIVE";
    const isInactive   = carrier.status === "INACTIVE";
    const isSuspended  = carrier.status === "SUSPENDED";
    const isBlacklisted = carrier.status === "BLACKLISTED";

    const handleStatusChange = (status: "PENDING" | "APPROVED" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLACKLISTED") => {
        updateMutation.mutate({ id: carrier.id, status });
    };

    const queryClient = useQueryClient();
    const [fmcsaLoading, setFmcsaLoading] = React.useState(false);

    const handleFmcsaVerify = async () => {
        if (!carrier.mcNumber && !carrier.dotNumber) return;
        setFmcsaLoading(true);
        try {
            await apiClient.post(`/operations/carriers/fmcsa/lookup`, {
                mcNumber: carrier.mcNumber,
                dotNumber: carrier.dotNumber,
            });
            toast.success(`FMCSA verification complete for ${carrier.companyName}`);
            queryClient.invalidateQueries({ queryKey: ['carriers', carrier.id] });
        } catch {
            toast.error(`FMCSA verification failed for ${carrier.companyName}`);
        } finally {
            setFmcsaLoading(false);
        }
    };

    return (
        // Stop propagation so row-click navigation doesn't fire when using the menu
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/carriers/${carrier.id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/carriers/${carrier.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    {isPending && (
                        <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> Approve
                        </DropdownMenuItem>
                    )}
                    {isPending && (
                        <DropdownMenuItem onClick={() => handleStatusChange("INACTIVE")}>
                            <Ban className="mr-2 h-4 w-4 text-slate-500" /> Reject
                        </DropdownMenuItem>
                    )}
                    {isActive && (
                        <DropdownMenuItem onClick={() => handleStatusChange("SUSPENDED")}>
                            <Pause className="mr-2 h-4 w-4 text-amber-500" /> Suspend
                        </DropdownMenuItem>
                    )}
                    {isActive && (
                        <DropdownMenuItem onClick={() => handleStatusChange("INACTIVE")}>
                            <CircleOff className="mr-2 h-4 w-4 text-slate-500" /> Deactivate
                        </DropdownMenuItem>
                    )}
                    {isInactive && (
                        <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> Reactivate
                        </DropdownMenuItem>
                    )}
                    {isSuspended && (
                        <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> Reinstate
                        </DropdownMenuItem>
                    )}
                    {!isBlacklisted && (
                        <DropdownMenuItem
                            onClick={() => handleStatusChange("BLACKLISTED")}
                            className="text-red-600 focus:text-red-600"
                        >
                            <ShieldX className="mr-2 h-4 w-4" /> Blacklist
                        </DropdownMenuItem>
                    )}

                    {(isActive || isPending) && (carrier.mcNumber || carrier.dotNumber) && (
                        <DropdownMenuItem onClick={handleFmcsaVerify} disabled={fmcsaLoading}>
                            <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
                            {fmcsaLoading ? "Verifying..." : "Verify FMCSA"}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={showDeleteDialog}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={() => {
                    deleteMutation.mutate(carrier.id);
                    setShowDeleteDialog(false);
                }}
                title="Delete Carrier"
                description={`Are you sure you want to delete ${carrier.companyName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
