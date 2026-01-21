"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AvatarUpload() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-20 w-20 rounded-full bg-muted" />
        <Button variant="outline">Upload new</Button>
      </CardContent>
    </Card>
  );
}
