"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function GeneralSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Organization name</label>
          <Input placeholder="Ultra TMS" />
        </div>
        <div>
          <label className="text-sm font-medium">Default timezone</label>
          <Input placeholder="America/Chicago" />
        </div>
        <Button>Save settings</Button>
      </CardContent>
    </Card>
  );
}
