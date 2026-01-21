import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/lib/types/auth";

interface UserRolesSectionProps {
  roles: Role[];
}

export function UserRolesSection({ roles }: UserRolesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roles assigned.</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{role.displayName || role.name}</p>
              {role.description && (
                <p className="text-muted-foreground">{role.description}</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
