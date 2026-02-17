"use client";

import { Load } from "@/types/loads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LoadCarrierTabProps {
    load: Load;
}

export function LoadCarrierTab({ load }: LoadCarrierTabProps) {
    if (!load.carrier) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 dashed border-muted-foreground/30">
                <Truck className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No carrier assigned</h3>
                <p className="text-sm text-muted-foreground mb-4">Assign a carrier to this load to see details.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Carrier Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        {load.carrier.legalName}
                        <Badge variant="outline" className="font-mono">{load.carrier.mcNumber}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Contact Info</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> (555) 123-4567
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> dispatch@{load.carrier.legalName.toLowerCase().replace(/\s/g, "")}.com
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Performance</div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">98%</div>
                                    <div className="text-xs text-muted-foreground">On Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-blue-600">142</div>
                                    <div className="text-xs text-muted-foreground">Loads</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Driver Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Driver & Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground">Driver Name</div>
                            <div className="font-medium">{load.driverName || "Unassigned"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Phone</div>
                            <div className="font-medium">{load.driverPhone || "--"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Truck Number</div>
                            <div className="font-medium">{load.truckNumber || "--"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Trailer Number</div>
                            <div className="font-medium">{load.trailerNumber || "--"}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Rate Info */}
            {(() => {
                const loadRecord = load as Load & { customerRate?: number; order?: { customerRate?: number } };
                const customerRate = loadRecord.order?.customerRate ?? loadRecord.customerRate ?? 0;
                const carrierRate = load.carrierRate ?? 0;
                const margin = customerRate - carrierRate;
                const marginPct = customerRate > 0 ? (margin / customerRate) * 100 : 0;
                return (
                    <>
                        <div className="grid grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-muted-foreground">Customer Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {customerRate > 0 ? `$${customerRate.toFixed(2)}` : '—'}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">Invoice Amount</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-muted-foreground">Carrier Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">${carrierRate.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Bill Amount</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Margin Calculation */}
                        {customerRate > 0 && (
                            <Card className="bg-slate-50 border-dashed">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Estimated Margin</span>
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${margin.toFixed(2)}
                                            </div>
                                            <div className={`text-xs font-medium ${margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {marginPct.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                );
            })()}
        </div>
    );
}
