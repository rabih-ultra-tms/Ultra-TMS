"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Load } from "@/types/loads";
import { Separator } from "@/components/ui/separator";
import { Calendar, Truck, Scale, Box, Info } from "lucide-react";
import Link from "next/link";

interface LoadSummaryCardProps {
    load: Load;
}

export function LoadSummaryCard({ load }: LoadSummaryCardProps) {
    const pickup = load.pickupDate ? new Date(load.pickupDate) : null;
    const delivery = load.deliveryDate ? new Date(load.deliveryDate) : null;

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wider text-xs">Load Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Route Visual */}
                <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[11px] top-2 bottom-8 w-0.5 border-l-2 border-dashed border-border" />

                    {/* Origin */}
                    <div className="flex gap-3 relative">
                        <div className="w-6 h-6 rounded-full border-4 border-blue-500 bg-white z-10 shrink-0" />
                        <div>
                            <div className="text-sm font-medium">{load.originCity}, {load.originState}</div>
                            <div className="text-xs text-muted-foreground">Origin</div>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex gap-3 relative">
                        <div className="w-6 h-6 rounded-full border-4 border-green-500 bg-white z-10 shrink-0" />
                        <div>
                            <div className="text-sm font-medium">{load.destinationCity}, {load.destinationState}</div>
                            <div className="text-xs text-muted-foreground">Destination</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <div className="text-xs text-muted-foreground">Pickup</div>
                            <div className="text-sm font-medium">{pickup ? pickup.toLocaleString() : '--'}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <div className="text-xs text-muted-foreground">Delivery</div>
                            <div className="text-sm font-medium">{delivery ? delivery.toLocaleString() : '--'}</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4" /> Equipment
                        </div>
                        <span className="text-sm font-medium">{load.equipmentType || 'Dry Van'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" /> Miles
                        </div>
                        <span className="text-sm font-medium">{load.miles || '--'} mi</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Scale className="h-4 w-4" /> Weight
                        </div>
                        <span className="text-sm font-medium">{load.weight?.toLocaleString() || '--'} lbs</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Box className="h-4 w-4" /> Commodity
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]" title={load.commodity || "General Freight"}>{load.commodity || "General Freight"}</span>
                    </div>
                </div>

                <Separator />

                {/* Order & Customer */}
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Order</span>
                        <Link href={`/operations/orders/${load.order?.id}`} className="text-sm font-mono text-blue-600 hover:underline">
                            {load.order?.orderNumber}
                        </Link>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Customer</span>
                        <Link href={`/crm/customers/${load.order?.customer?.id}`} className="text-sm text-blue-600 hover:underline">
                            {load.order?.customer?.name}
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
