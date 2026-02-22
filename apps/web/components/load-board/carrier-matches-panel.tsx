"use client";

import { Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CarrierMatchCard } from "./carrier-match-card";
import type { CarrierMatch } from "@/types/load-board";

interface CarrierMatchesPanelProps {
    matches?: CarrierMatch[];
    isLoading: boolean;
    onTender: (carrierId: string) => void;
    isTendering: boolean;
}

export function CarrierMatchesPanel({
    matches,
    isLoading,
    onTender,
    isTendering,
}: CarrierMatchesPanelProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        Suggested Carriers
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!matches?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        Suggested Carriers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No carrier matches found for this posting.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const sorted = [...matches].sort(
        (a, b) => b.matchScore - a.matchScore
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Suggested Carriers ({sorted.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {sorted.map((match) => (
                    <CarrierMatchCard
                        key={match.id}
                        match={match}
                        onTender={() => onTender(match.carrierId)}
                        isTendering={isTendering}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
