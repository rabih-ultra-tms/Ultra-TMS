import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Permission } from "@/lib/types/auth";

interface PermissionsMatrixProps {
  permissions: Permission[];
}

export function PermissionsMatrix({ permissions }: PermissionsMatrixProps) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    const group = permission.group || "General";
    acc[group] = acc[group] ? [...acc[group], permission] : [permission];
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {Object.entries(grouped).map(([group, items]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((permission) => (
              <div key={permission.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{permission.name}</p>
                <p className="text-xs text-muted-foreground">{permission.code}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
