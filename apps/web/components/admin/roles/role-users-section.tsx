import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/types/auth";

interface RoleUsersSectionProps {
  users: User[];
}

export function RoleUsersSection({ users }: RoleUsersSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users with this role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {users.length === 0 ? (
          <p className="text-muted-foreground">No users assigned to this role.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-md border px-3 py-2">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
