"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Security alerts</p>
            <p className="text-xs text-muted-foreground">Notify admins on critical events</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Weekly summaries</p>
            <p className="text-xs text-muted-foreground">Email weekly activity summary</p>
          </div>
          <Switch />
        </div>
        <Button>Save notification settings</Button>
      </CardContent>
    </Card>
  );
}
