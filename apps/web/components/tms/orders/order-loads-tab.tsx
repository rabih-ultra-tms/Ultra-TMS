"use client";

import { Order, OrderLoad } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

export function OrderLoadsTab({ order }: { order: Order }) {
    if (order.loads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
                <FolderOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Loads Created</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    This order has not been dispatched to a carrier yet.
                    To start the dispatch process, create a load.
                </p>
                <Button>Create Load</Button>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {order.loads.map((load: OrderLoad) => (
                <div key={load.id} className="p-4 border rounded shadow-sm hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                        <div className="font-medium">{load.loadNumber}</div>
                        <div className="text-sm text-muted-foreground">{load.status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
