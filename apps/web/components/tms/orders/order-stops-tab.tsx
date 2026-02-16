"use client";

import { Order } from "@/types/orders";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OrderStopsTab({ order }: { order: Order }) {
    const stops = [...order.stops].sort((a, b) => a.stopSequence - b.stopSequence);

    return (
        <div className="space-y-6">
            <div className="relative border-l-2 border-muted pl-6 space-y-10 py-2 ml-4">
                {stops.map((stop, index) => {
                    const isLast = index === stops.length - 1;
                    const isPickup = stop.stopType === "PICKUP";
                    const isDelivery = stop.stopType === "DELIVERY";

                    return (
                        <div key={stop.id} className="relative group">
                            {/* Timeline Dot */}
                            <div className={cn(
                                "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 bg-background ring-4 ring-background transition-colors",
                                isPickup ? "border-blue-500 bg-blue-500" :
                                    isDelivery ? "border-emerald-500 bg-emerald-500" :
                                        "border-gray-500"
                            )} />

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isPickup ? "default" : isDelivery ? "secondary" : "outline"}>
                                            Stop {stop.stopSequence} • {stop.stopType}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {stop.facilityName || "Unknown Facility"}
                                        </span>
                                    </div>

                                    <div className="text-lg font-semibold mt-1">
                                        {stop.city}, {stop.state} {stop.postalCode}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {stop.addressLine1}
                                    </div>
                                </div>

                                <div className="space-y-2 text-right sm:min-w-[180px]">
                                    <div className="text-sm font-medium">
                                        {stop.appointmentDate ? format(new Date(stop.appointmentDate), "EEE, MMM d, yyyy") : "No Date"}
                                    </div>
                                    {stop.appointmentTimeStart && (
                                        <div className="text-xs text-muted-foreground">
                                            {stop.appointmentTimeStart} - {stop.appointmentTimeEnd || "Any"}
                                        </div>
                                    )}

                                    {/* Stop Status - Badge Placeholder */}
                                    <Badge variant="outline" className="text-xs">
                                        Pending
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
