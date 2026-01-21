import { Card, CardContent } from "@/components/ui/card";
import type { Activity } from "@/lib/types/crm";
import { ActivityTypeIcon } from "./activity-type-icon";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ActivityTypeIcon type={activity.type} className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="font-medium">{activity.subject}</div>
          {activity.description ? (
            <div className="text-sm text-muted-foreground">{activity.description}</div>
          ) : null}
          <div className="text-xs text-muted-foreground">
            {new Date(activity.createdAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
