"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoadStats } from "@/types/loads";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KPIStatCardsProps {
    stats?: LoadStats;
    isLoading?: boolean;
}

export function KPIStatCards({ stats, isLoading }: KPIStatCardsProps) {
    // Mock data if stats unavailable
    const data = stats || {
        total: 847,
        unassigned: 23,
        inTransit: 234,
        deliveredToday: 56,
        avgMargin: 18.4,
        totalActive: 120 // Derived/Extra
    };

    const items = [
        {
            label: "Total Loads",
            value: data.total.toString(),
            subtext: "+3 today",
            trend: "up",
            color: "text-foreground"
        },
        {
            label: "Unassigned",
            value: data.unassigned.toString(),
            subtext: "5 past pickup",
            trend: "down", // Bad trend logic invert? No, just display
            color: "text-red-600",
            subtextColor: "text-red-500"
        },
        {
            label: "In Transit",
            value: data.inTransit.toString(),
            subtext: "12 need attention",
            trend: "up",
            color: "text-blue-600",
            subtextColor: "text-amber-600"
        },
        {
            label: "Delivered Today",
            value: data.deliveredToday.toString(),
            subtext: "+8 vs yesterday",
            trend: "up",
            color: "text-green-600",
            subtextColor: "text-green-600"
        },
        {
            label: "Avg Margin",
            value: `${data.avgMargin}%`,
            subtext: "+1.2 pts",
            trend: "up",
            color: "text-foreground",
            subtextColor: "text-green-600"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((item, i) => (
                <Card key={i} className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${item.color}`}>
                            {isLoading ? "..." : item.value}
                        </div>
                        <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${item.subtextColor || "text-muted-foreground"}`}>
                            {item.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {item.subtext}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
