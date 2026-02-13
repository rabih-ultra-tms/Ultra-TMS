"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Load } from "@/types/loads";
import { MapPin, Clock, Phone, Share2, PhoneCall, Gauge } from "lucide-react";

interface LoadTrackingCardProps {
    load: Load;
}

export function LoadTrackingCard({ load }: LoadTrackingCardProps) {
    // Mock ETA calculation
    const isDispatched = ['DISPATCHED', 'IN_TRANSIT', 'AT_DELIVERY'].includes(load.status);
    const eta = isDispatched ? new Date(Date.now() + 14 * 60 * 60 * 1000) : null; // +14 hours

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wider text-xs">Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Map Snippet */}
                <div className="bg-muted rounded-md border h-[200px] flex items-center justify-center relative overflow-hidden group">
                    {/* Placeholder Map Image/Text */}
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-muted-foreground text-sm">
                        Map Placeholder
                    </div>
                    {/* Mock Route Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 20 80 Q 50 20 80 50" stroke="blue" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    </svg>
                    {/* Mock Truck */}
                    <div className="absolute top-[45%] left-[60%] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm z-10 animate-pulse" />
                </div>

                {/* Last Location */}
                <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <div className="text-sm font-medium">{load.lastLocation || load.originCity + ', ' + load.originState}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Updated {load.lastLocationTime ? '2h ago' : 'Just now'}
                        </div>
                    </div>
                </div>

                {/* Speed */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Gauge className="h-4 w-4" /> Current Speed
                    </div>
                    <span className="font-medium">62 mph</span>
                </div>


                <Separator />

                {/* ETA */}
                <div>
                    <div className="text-xs text-muted-foreground mb-1">Estimated Arrival</div>
                    {eta ? (
                        <>
                            <div className="text-lg font-semibold text-foreground">
                                {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                                14h 22m remaining
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground italic">
                            Tracking starts when dispatched
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground">
                    Next Stop: <span className="font-medium text-foreground">{load.destinationCity}, {load.destinationState}</span>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                        <PhoneCall className="h-4 w-4 mr-2" /> Add Check Call
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Phone className="h-4 w-4 mr-2" /> Contact Driver
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Share2 className="h-4 w-4 mr-2" /> Share Tracking
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Clock className="h-4 w-4 mr-2" /> Update ETA
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
