"use client";

import { Load } from "@/types/loads";
import { StopsTable } from "@/components/tms/stops/stops-table";

interface LoadRouteTabProps {
    load: Load;
}

export function LoadRouteTab({ load }: LoadRouteTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Route & Stops</h3>
                <p className="text-sm text-muted-foreground">
                    Manage pickup and delivery stops with real-time status tracking
                </p>
            </div>

            <StopsTable orderId={load.order?.id ?? ''} />

            {/* Map Placeholder - Future Enhancement */}
            <div className="rounded-lg border bg-muted h-[300px] flex items-center justify-center text-muted-foreground">
                Detailed Route Map Visualization (Coming Soon)
            </div>
        </div>
    );
}
