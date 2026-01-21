import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerStatusBadge } from "./customer-status-badge";
import type { Customer } from "@/lib/types/crm";

interface CustomerDetailCardProps {
  customer: Customer;
}

export function CustomerDetailCard({ customer }: CustomerDetailCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{customer.name}</CardTitle>
          {customer.legalName && (
            <p className="text-sm text-muted-foreground">{customer.legalName}</p>
          )}
        </div>
        <CustomerStatusBadge status={customer.status} />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Primary Email</p>
          <p className="font-medium">{customer.email || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Primary Phone</p>
          <p className="font-medium">{customer.phone || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Industry</p>
          <p className="font-medium">{customer.industry || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Account Manager</p>
          <p className="font-medium">{customer.accountManager?.name || "Unassigned"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
