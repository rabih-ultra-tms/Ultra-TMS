import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Permission } from "@/lib/types/auth";

interface PermissionsMatrixProps {
  permissions: Permission[];
}

export function PermissionsMatrix({ permissions }: PermissionsMatrixProps) {
  const grouped = permissions.reduce<Record<string, Record<string, Permission[]>>>(
    (acc, permission) => {
      const code = permission.code || permission.name;
      const [serviceFromCode, resourceFromCode] = code.split(".");
      const service = permission.group || serviceFromCode || "general";
      const resource = resourceFromCode || "general";

      if (!acc[service]) {
        acc[service] = {};
      }
      if (!acc[service][resource]) {
        acc[service][resource] = [];
      }
      acc[service][resource].push(permission);
      return acc;
    },
    {}
  );

  return (
    <div className="grid gap-4">
      {Object.entries(grouped).map(([service, resources]) => (
        <Card key={service}>
          <CardHeader>
            <CardTitle>
              {service.charAt(0).toUpperCase() + service.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(resources).map(([resource, resourcePermissions]) => (
              <div key={`${service}-${resource}`} className="rounded-md border">
                <div className="border-b px-3 py-2">
                  <p className="text-sm font-medium">
                    {resource === "general"
                      ? "General"
                      : resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resourcePermissions.length} permissions
                  </p>
                </div>
                <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {resourcePermissions.map((permission) => (
                    <div key={permission.code || permission.id} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">
                        {permission.name || permission.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permission.code}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
