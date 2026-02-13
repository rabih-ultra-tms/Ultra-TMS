"use client";

import { useLoadTimeline } from "@/lib/hooks/tms/use-loads";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Circle, FileText, UserPlus, CheckCircle, Truck, Info, Clock } from "lucide-react";

interface LoadTimelineTabProps {
    loadId: string;
}

export function LoadTimelineTab({ loadId }: LoadTimelineTabProps) {
    const { data: events, isLoading } = useLoadTimeline(loadId);

    if (isLoading) {
        return <div className="space-y-6 pl-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>;
    }

    if (!events || events.length === 0) {
        return <div className="text-muted-foreground p-8 text-center">No timeline events recorded.</div>;
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'status': return <Truck className="h-4 w-4" />;
            case 'document': return <FileText className="h-4 w-4" />;
            case 'assignment': return <UserPlus className="h-4 w-4" />;
            case 'creation': return <CheckCircle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'status': return "bg-blue-100 text-blue-600 border-blue-200";
            case 'document': return "bg-purple-100 text-purple-600 border-purple-200";
            case 'assignment': return "bg-orange-100 text-orange-600 border-orange-200";
            case 'creation': return "bg-green-100 text-green-600 border-green-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="space-y-8 pl-2">
            <h3 className="text-lg font-medium mb-4">Activity Timeline</h3>
            <div className="relative border-l ml-3 space-y-8">
                {events.map((event: any, index: number) => (
                    <div key={event.id} className="ml-6 relative">
                        {/* Icon Marker */}
                        <div className={cn("absolute -left-[37px] top-1 w-8 h-8 rounded-full border flex items-center justify-center z-10 bg-white", getColor(event.type))}>
                            {getIcon(event.type)}
                        </div>

                        {/* Event Content */}
                        <div className="flex flex-col gap-1 bg-card rounded-md border p-3 shadow-sm hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">{event.title}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(event.date).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                                by {event.user}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
