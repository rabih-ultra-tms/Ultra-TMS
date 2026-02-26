"use client";

import { OrderDetailResponse } from "@/types/orders";
import { MessageSquare } from "lucide-react";

interface OrderNotesTabProps {
    order: OrderDetailResponse;
}

export function OrderNotesTab({ order }: OrderNotesTabProps) {
    const notes = order.internalNotes;

    if (!notes) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Notes</h3>
                <p className="text-sm text-muted-foreground">
                    No internal notes have been added to this order yet. Use the Edit Order form to add notes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Internal Notes</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
            </div>
        </div>
    );
}
