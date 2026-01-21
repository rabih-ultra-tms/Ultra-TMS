"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProfileForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">First name</label>
            <Input placeholder="Jane" />
          </div>
          <div>
            <label className="text-sm font-medium">Last name</label>
            <Input placeholder="Doe" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input type="email" placeholder="jane@company.com" />
        </div>
        <Button>Save profile</Button>
      </CardContent>
    </Card>
  );
}
