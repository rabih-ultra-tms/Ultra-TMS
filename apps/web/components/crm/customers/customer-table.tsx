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
import { CustomerStatusBadge } from "./customer-status-badge";
import type { Customer } from "@/lib/types/crm";

interface CustomerTableProps {
  customers: Customer[];
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

export function CustomerTable({
  customers,
  pagination,
  onPageChange,
  onView,
  isLoading,
}: CustomerTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.code}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{customer.name}</div>
                  {customer.legalName && (
                    <div className="text-sm text-muted-foreground">{customer.legalName}</div>
                  )}
                </TableCell>
                <TableCell>
                  <CustomerStatusBadge status={customer.status} />
                </TableCell>
                <TableCell>{customer.email || "—"}</TableCell>
                <TableCell>{customer.phone || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(customer.id)}
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
