import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "@/lib/types/crm";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
}

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  const variant = status === "ACTIVE" ? "default" : status === "SUSPENDED" ? "destructive" : "outline";
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}
