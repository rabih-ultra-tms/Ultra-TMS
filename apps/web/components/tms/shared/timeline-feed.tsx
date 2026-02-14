import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';
import type { TimelineEvent } from '@/types/orders';

interface TimelineFeedProps {
    events: TimelineEvent[];
    emptyMessage?: string;
}

export function TimelineFeed({ events, emptyMessage = 'No activity yet' }: TimelineFeedProps) {
    if (events.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{emptyMessage}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event, index) => (
                <Card key={event.id} className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex flex-col items-center">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                            {index < events.length - 1 && (
                                <div className="absolute top-3 h-full w-0.5 bg-border" />
                            )}
                        </div>

                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium">{event.eventType}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                </span>
                            </div>

                            {event.userName && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>{event.userName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
