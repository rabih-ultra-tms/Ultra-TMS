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
import { MoreHorizontal, Eye, Pencil, Trash2, Ban, CheckSquare, Pause, Star } from "lucide-react";
import { OperationsCarrierListItem } from "@/types/carriers";
import { useDeleteCarrier, useUpdateCarrier } from "@/lib/hooks/operations";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface CarrierActionsMenuProps {
    carrier: OperationsCarrierListItem;
}

export function CarrierActionsMenu({ carrier }: CarrierActionsMenuProps) {
    const router = useRouter();
    const deleteMutation = useDeleteCarrier();
    const updateMutation = useUpdateCarrier();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    // Status helpers
    const isActive = carrier.status === "ACTIVE";
    const isPreferred = carrier.status === "PREFERRED";
    const isBlacklisted = carrier.status === "BLACKLISTED";

    const handleStatusChange = (status: "ACTIVE" | "INACTIVE" | "PREFERRED" | "ON_HOLD" | "BLACKLISTED") => {
        updateMutation.mutate({ id: carrier.id, status });
    };

    return (
        <>
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
                    {!isActive && (
                        <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> Activate
                        </DropdownMenuItem>
                    )}
                    {!isPreferred && (
                        <DropdownMenuItem onClick={() => handleStatusChange("PREFERRED")}>
                            <Star className="mr-2 h-4 w-4 text-yellow-500" /> Mark Preferred
                        </DropdownMenuItem>
                    )}
                    {carrier.status !== "ON_HOLD" && (
                        <DropdownMenuItem onClick={() => handleStatusChange("ON_HOLD")}>
                            <Pause className="mr-2 h-4 w-4 text-orange-500" /> Put On Hold
                        </DropdownMenuItem>
                    )}
                    {!isBlacklisted && (
                        <DropdownMenuItem onClick={() => handleStatusChange("BLACKLISTED")}>
                            <Ban className="mr-2 h-4 w-4 text-red-600" /> Blacklist
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
        </>
    );
}
