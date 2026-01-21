import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "@/lib/types/crm";
import { cn } from "@/lib/utils";

const statusStyles: Record<CustomerStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  PROSPECT: "bg-blue-100 text-blue-700 border-blue-200",
  SUSPENDED: "bg-red-100 text-red-700 border-red-200",
};

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
}

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
}
