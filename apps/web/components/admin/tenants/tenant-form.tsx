"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TenantForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input placeholder="Tenant name" />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input placeholder="tenant-slug" />
        </div>
        <Button>Save tenant</Button>
      </CardContent>
    </Card>
  );
}
