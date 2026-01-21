import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActiveSessions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        No active sessions data available.
      </CardContent>
    </Card>
  );
}
