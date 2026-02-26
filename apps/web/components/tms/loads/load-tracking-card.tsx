"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Load } from "@/types/loads";
import { MapPin, Clock, Phone, Share2, PhoneCall, Gauge, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCheckCall } from "@/lib/hooks/tms/use-checkcalls";

interface LoadTrackingCardProps {
    load: Load;
    onAddCheckCall?: () => void;
}

export function LoadTrackingCard({ load, onAddCheckCall }: LoadTrackingCardProps) {
    const [etaDialogOpen, setEtaDialogOpen] = useState(false);
    const [etaValue, setEtaValue] = useState("");

    const createCheckCall = useCreateCheckCall();

    // Mock ETA calculation
    const isDispatched = ['DISPATCHED', 'IN_TRANSIT', 'AT_DELIVERY'].includes(load.status);
    const eta = isDispatched ? new Date(Date.now() + 14 * 60 * 60 * 1000) : null; // +14 hours

    const handleContactDriver = () => {
        if (load.driverPhone) {
            window.location.href = `tel:${load.driverPhone}`;
        } else {
            toast.info("No driver phone on file", {
                description: load.driverName
                    ? `${load.driverName} has no phone number assigned to this load.`
                    : "No driver assigned to this load.",
            });
        }
    };

    const handleShareTracking = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Tracking link copied", {
                description: "Share this link to allow others to view this load.",
            });
        } catch {
            toast.error("Could not copy to clipboard");
        }
    };

    const handleUpdateEta = async () => {
        if (!etaValue) return;

        const ext = load as unknown as Record<string, unknown>;
        const city = (ext.currentCity as string | undefined) ?? load.originCity ?? '';
        const state = (ext.currentState as string | undefined) ?? load.originState ?? '';

        await createCheckCall.mutateAsync({
            loadId: load.id,
            type: 'CHECK_CALL',
            city,
            state,
            etaToNextStop: new Date(etaValue).toISOString(),
            notes: `ETA updated to ${new Date(etaValue).toLocaleString()}`,
        });

        setEtaDialogOpen(false);
        setEtaValue("");
    };

    return (
        <>
            <Card className="h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wider text-xs">Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Map Snippet */}
                    <div className="bg-muted rounded-md border h-[200px] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-muted-foreground text-sm">
                            Map Placeholder
                        </div>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M 20 80 Q 50 20 80 50" stroke="blue" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                        </svg>
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
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                            onClick={onAddCheckCall}
                        >
                            <PhoneCall className="h-4 w-4 mr-2" /> Add Check Call
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            size="sm"
                            onClick={handleContactDriver}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Driver
                            {load.driverPhone && (
                                <span className="ml-auto text-xs text-muted-foreground font-normal">
                                    {load.driverPhone}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            size="sm"
                            onClick={handleShareTracking}
                        >
                            <Share2 className="h-4 w-4 mr-2" /> Share Tracking
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            size="sm"
                            onClick={() => setEtaDialogOpen(true)}
                        >
                            <Clock className="h-4 w-4 mr-2" /> Update ETA
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Update ETA Dialog */}
            <Dialog open={etaDialogOpen} onOpenChange={setEtaDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Update ETA</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="eta-input">Estimated Arrival</Label>
                            <Input
                                id="eta-input"
                                type="datetime-local"
                                value={etaValue}
                                onChange={(e) => setEtaValue(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This will log a check call and update the ETA for this load.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEtaDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateEta}
                            disabled={!etaValue || createCheckCall.isPending}
                        >
                            {createCheckCall.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update ETA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
