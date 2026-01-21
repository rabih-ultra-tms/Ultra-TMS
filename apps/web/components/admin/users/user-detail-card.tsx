import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/types/auth";
import { UserStatusBadge } from "./user-status-badge";

interface UserDetailCardProps {
  user: User;
}

export function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{user.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <UserStatusBadge status={user.status} />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Tenant</p>
          <p className="font-medium">{user.tenantName || user.tenantId}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">MFA</p>
          <p className="font-medium">{user.mfaEnabled ? "Enabled" : "Disabled"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Roles</p>
          <p className="font-medium">
            {user.roles?.length
              ? user.roles.map((role) => role.displayName || role.name).join(", ")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last login</p>
          <p className="font-medium">{user.lastLoginAt || "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
