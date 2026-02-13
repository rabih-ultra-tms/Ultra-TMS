"use client";

import { Load } from "@/types/loads";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Building2, User, FileText, Clock } from "lucide-react";

interface LoadRouteTabProps {
    load: Load;
}

export function LoadRouteTab({ load }: LoadRouteTabProps) {
    const stops = load.stops || [];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Route & Stops</h3>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border -z-10" />

                <div className="space-y-6">
                    {stops.map((stop, index) => {
                        const isFirst = index === 0;
                        const isLast = index === stops.length - 1;
                        const circleColor = isFirst ? "border-blue-500 bg-blue-50" : isLast ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50";
                        const badgeColor = isFirst ? "bg-blue-100 text-blue-700" : isLast ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";

                        return (
                            <div key={stop.id || index} className="flex gap-4">
                                {/* Timeline Marker */}
                                <div className={cn("w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white shrink-0 z-10 font-bold text-sm", circleColor)}>
                                    {index + 1}
                                </div>

                                {/* Stop Card */}
                                <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("border-0 font-medium", badgeColor)}>
                                                    {stop.stopType}
                                                </Badge>
                                                {stop.status && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {stop.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="font-semibold text-lg flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {stop.facilityName || "Facility Name"}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="text-sm font-medium">
                                                {new Date(stop.appointmentDate || "").toLocaleDateString()}
                                                {stop.appointmentTime && ` ${stop.appointmentTime}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground italic">
                                                Scheduled
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4 mt-0.5" />
                                                <span>
                                                    {stop.address || "123 Street Name"}<br />
                                                    {stop.city}, {stop.state} {stop.zip}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>{stop.contactName || "Contact N/A"} {stop.contactPhone && `• ${stop.contactPhone}`}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {stop.notes && (
                                                <div className="flex items-start gap-2 text-muted-foreground bg-muted/50 p-2 rounded">
                                                    <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                                                    <span className="italic">{stop.notes}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Appointment window: {stop.appointmentTime || "08:00 - 16:00"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action items for stop could go here (Confirm Arrival etc) */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-lg border bg-muted h-[300px] flex items-center justify-center text-muted-foreground">
                Detailed Route Map Visualization
            </div>
        </div>
    );
}
