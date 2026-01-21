"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function SecuritySettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Session timeout (minutes)</label>
          <Input type="number" min={5} placeholder="30" />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Require MFA</p>
            <p className="text-xs text-muted-foreground">Enforce MFA for all users</p>
          </div>
          <Switch />
        </div>
        <Button>Save security settings</Button>
      </CardContent>
    </Card>
  );
}
