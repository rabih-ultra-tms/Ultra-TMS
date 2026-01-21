import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Permission } from "@/lib/types/auth";

interface PermissionGroupCardProps {
  title: string;
  permissions: Permission[];
}

export function PermissionGroupCard({ title, permissions }: PermissionGroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {permissions.map((permission) => (
          <div key={permission.id} className="rounded-md border p-3 text-sm">
            <p className="font-medium">{permission.name}</p>
            <p className="text-xs text-muted-foreground">{permission.code}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
