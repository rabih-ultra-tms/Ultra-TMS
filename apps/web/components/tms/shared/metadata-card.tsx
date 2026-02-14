import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, User, Hash } from 'lucide-react';

interface MetadataCardProps {
    createdAt: string;
    updatedAt: string;
    createdByName?: string;
    externalId?: string;
    sourceSystem?: string;
}

export function MetadataCard({
    createdAt,
    updatedAt,
    createdByName,
    externalId,
    sourceSystem,
}: MetadataCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{format(new Date(createdAt), 'PPp')}</p>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{format(new Date(updatedAt), 'PPp')}</p>
                    </div>
                </div>

                {createdByName && (
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-muted-foreground">Created By</p>
                            <p className="font-medium">{createdByName}</p>
                        </div>
                    </div>
                )}

                {externalId && (
                    <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-muted-foreground">External ID</p>
                            <p className="font-mono text-xs">{externalId}</p>
                        </div>
                    </div>
                )}

                {sourceSystem && (
                    <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-muted-foreground">Source</p>
                            <p className="font-medium">{sourceSystem}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
