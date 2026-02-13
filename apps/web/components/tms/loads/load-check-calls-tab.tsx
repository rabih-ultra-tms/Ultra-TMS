"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, MapPin, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface LoadCheckCallsTabProps {
    loadId: string;
}

export function LoadCheckCallsTab({ loadId }: LoadCheckCallsTabProps) {
    const { data: checkCalls, isLoading } = useQuery({
        queryKey: ['check-calls', loadId],
        queryFn: async () => {
            const res = await apiClient.get<any>(`/api/v1/loads/${loadId}/check-calls`);
            return res.data || [];
        }
    });

    if (isLoading) return <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>;

    if (!checkCalls || checkCalls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 rounded-lg dashed border-muted-foreground/30">
                <PhoneCall className="h-8 w-8 mb-4 opacity-50" />
                <p>No check calls recorded.</p>
                <Button variant="link" className="mt-2">Add Check Call</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {checkCalls.map((call: any) => (
                <Card key={call.id}>
                    <CardContent className="p-4 flex gap-4">
                        <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-blue-600 shrink-0">
                            <PhoneCall className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                                <div className="font-medium flex items-center gap-2">
                                    {call.type || "Check Call"}
                                    <Badge variant="outline" className="text-[10px]">{call.source || "Manual"}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(call.createdAt).toLocaleString()}
                                </div>
                            </div>
                            {call.location && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {call.location}
                                </div>
                            )}
                            {call.notes && (
                                <div className="text-sm mt-2 bg-muted p-2 rounded text-muted-foreground italic">
                                    "{call.notes}"
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
