"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/orders";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { STATUS_INTENTS, STATUS_LABELS } from "@/components/tms/orders/order-columns";
import { format } from "date-fns";
import { Calendar, Building2, User } from "lucide-react";

export function OrderDetailOverview({ order }: { order: Order }) {
    const pickupStop = order.stops.find(s => s.stopSequence === 1);
    const deliveryStop = [...order.stops].sort((a, b) => b.stopSequence - a.stopSequence)[0];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Main Info Card */}
            <Card className="col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-2xl font-bold">{order.orderNumber}</div>
                            {order.customerReference && (
                                <div className="text-sm text-muted-foreground">Ref: {order.customerReference}</div>
                            )}
                        </div>
                        <StatusBadge intent={STATUS_INTENTS[order.status]} withDot>
                            {STATUS_LABELS[order.status]}
                        </StatusBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> Customer
                            </span>
                            <div className="font-medium text-sm">Customer {order.customerId.slice(0, 8)}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" /> Created By
                            </span>
                            <div className="font-medium text-sm">Dispatcher</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Route Summary */}
            <Card className="col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Route Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Origin */}
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                            <div className="w-0.5 h-full bg-border mx-auto my-1" />
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="text-xs font-semibold text-blue-500 uppercase">Origin</div>
                            <div className="font-medium">{pickupStop?.city}, {pickupStop?.state}</div>
                            <div className="text-xs text-muted-foreground">{pickupStop?.addressLine1}</div>
                            {pickupStop?.appointmentDate && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(pickupStop.appointmentDate), "MMM d, yyyy")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-emerald-500 uppercase">Destination</div>
                            <div className="font-medium">{deliveryStop?.city}, {deliveryStop?.state}</div>
                            <div className="text-xs text-muted-foreground">{deliveryStop?.addressLine1}</div>
                            {deliveryStop?.appointmentDate && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(deliveryStop.appointmentDate), "MMM d, yyyy")}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats / Financials Placeholder */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Weight</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {order.items.reduce((sum, item) => sum + (item.weightLbs || 0), 0).toLocaleString()} lbs
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Stops</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{order.stops.length}</div>
                </CardContent>
            </Card>
        </div>
    );
}
