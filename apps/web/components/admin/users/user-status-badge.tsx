import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

const statusStyles: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  SUSPENDED: "bg-red-100 text-red-700 border-red-200",
  LOCKED: "bg-red-100 text-red-700 border-red-200",
  INVITED: "bg-blue-100 text-blue-700 border-blue-200",
};

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
}
