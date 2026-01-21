import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { User } from "@/lib/types/auth";
import { UserStatusBadge } from "./user-status-badge";
import { ShieldCheck } from "lucide-react";

interface UsersTableProps {
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onView: (id: string) => void;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  pagination,
  onPageChange,
  onView,
  isLoading,
}: UsersTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  {user.roles?.length
                    ? user.roles.map((role) => role.displayName || role.name).join(", ")
                    : "—"}
                </TableCell>
                <TableCell>
                  {user.mfaEnabled ? (
                    <span
                      className="inline-flex items-center gap-1 text-sm text-green-600"
                      aria-label="MFA enabled"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Disabled</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(user.id)}
                    disabled={isLoading}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && onPageChange ? (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
