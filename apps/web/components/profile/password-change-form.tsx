"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PasswordChangeForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current password</label>
          <Input type="password" />
        </div>
        <div>
          <label className="text-sm font-medium">New password</label>
          <Input type="password" />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm password</label>
          <Input type="password" />
        </div>
        <Button>Update password</Button>
      </CardContent>
    </Card>
  );
}
