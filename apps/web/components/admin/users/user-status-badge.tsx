import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/types/auth";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getVariant = () => {
    if (status === "ACTIVE") return "default";
    if (status === "SUSPENDED" || status === "LOCKED") return "destructive";
    if (status === "PENDING" || status === "INVITED") return "secondary";
    return "outline";
  };
  
  return (
    <Badge variant={getVariant()} className="capitalize">
      {status}
    </Badge>
  );
}
