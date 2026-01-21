"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function MFASettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MFA settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Enable MFA</p>
            <p className="text-xs text-muted-foreground">Require 6-digit code at login</p>
          </div>
          <Switch />
        </div>
        <Button variant="outline">Configure MFA</Button>
      </CardContent>
    </Card>
  );
}
