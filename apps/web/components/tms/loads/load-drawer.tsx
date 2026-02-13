"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Load } from "@/types/loads";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Map, Edit, Eye } from "lucide-react";
import { LoadStatusBadge } from "./load-status-badge";
import { Separator } from "@/components/ui/separator";

interface LoadDrawerProps {
    load: Load | null;
    open: boolean;
    onClose: () => void;
    onEdit?: (load: Load) => void;
    onViewDetails?: (load: Load) => void;
}

export function LoadDrawer({ load, open, onClose, onEdit, onViewDetails }: LoadDrawerProps) {
    if (!load) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[460px] sm:w-[540px] p-0 flex flex-col gap-0 border-l shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold">{load.loadNumber}</h2>
                        <LoadStatusBadge status={load.status} variant="dot-label" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit?.(load)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button size="sm" onClick={() => onViewDetails?.(load)}>
                            <Eye className="h-4 w-4 mr-2" /> Details
                        </Button>
                        {/* Native Close is included in SheetContent via X icon usually, but design has custom close */}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                    <div className="px-4 border-b">
                        <TabsList className="h-10 bg-transparent p-0">
                            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">Overview</TabsTrigger>
                            <TabsTrigger value="stops" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">Stops</TabsTrigger>
                            <TabsTrigger value="docs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">Documents</TabsTrigger>
                            <TabsTrigger value="map" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">Map</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                        <TabsContent value="overview" className="space-y-6 mt-0">
                            {/* Route Card Mockup */}
                            <div className="bg-card border rounded-lg p-4 shadow-sm">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center pt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm ring-1 ring-blue-100" />
                                            <div className="w-0.5 h-full bg-border my-1" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-100" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div>
                                                <div className="font-semibold">{load.originCity}, {load.originState}</div>
                                                <div className="text-xs text-muted-foreground">{load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : '--'}</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold">{load.destinationCity}, {load.destinationState}</div>
                                                <div className="text-xs text-muted-foreground">{load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : '--'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-card border rounded-md">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Rate</div>
                                    <div className="font-semibold">${load.carrierRate?.toLocaleString() || "--"}</div>
                                </div>
                                <div className="p-3 bg-card border rounded-md">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Weight</div>
                                    <div className="font-semibold">{load.weight?.toLocaleString() || "--"} lbs</div>
                                </div>
                                <div className="p-3 bg-card border rounded-md">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Miles</div>
                                    <div className="font-semibold">{load.miles || "--"} mi</div>
                                </div>
                                <div className="p-3 bg-card border rounded-md">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Equipment</div>
                                    <div className="font-semibold">{load.equipmentType || "Dry Van"}</div>
                                </div>
                            </div>

                            {/* Carrier Card */}
                            <div className="bg-card border rounded-lg p-4">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Carrier</div>
                                {load.carrier ? (
                                    <div>
                                        <div className="font-bold text-base text-blue-600 cursor-pointer hover:underline">{load.carrier.legalName}</div>
                                        <div className="text-xs text-muted-foreground">MC# {load.carrier.mcNumber}</div>
                                    </div>
                                ) : (
                                    <div className="text-red-500 font-medium text-sm flex items-center gap-2">
                                        Unassigned
                                        <Button variant="link" size="sm" className="h-auto p-0 text-red-600 underline">Assign Carrier</Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="stops" className="mt-0">
                            <div className="text-center text-muted-foreground py-8">Stops Timeline UI (Coming Soon)</div>
                        </TabsContent>

                        <TabsContent value="docs" className="mt-0">
                            <div className="text-center text-muted-foreground py-8">Documents List UI (Coming Soon)</div>
                        </TabsContent>

                        <TabsContent value="map" className="mt-0 h-full min-h-[300px] bg-muted flex items-center justify-center rounded-lg border">
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <Map className="h-8 w-8 opacity-50" />
                                <span>Map Preview</span>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
