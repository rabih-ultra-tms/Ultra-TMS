"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function TenantSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Timezone</label>
          <Input placeholder="America/Chicago" />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Require MFA</p>
            <p className="text-xs text-muted-foreground">Enforce MFA for this tenant</p>
          </div>
          <Switch />
        </div>
        <Button>Save settings</Button>
      </CardContent>
    </Card>
  );
}
