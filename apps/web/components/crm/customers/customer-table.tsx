import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/theme-provider";
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
  onViewContacts?: (id: string) => void;
  isLoading?: boolean;
}

export function CustomerTable({
  customers,
  pagination,
  onPageChange,
  onView,
  onViewContacts,
  isLoading,
}: CustomerTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getRowBg = (index: number) => {
    const lightBg = index % 2 === 0 ? "bg-background" : "bg-slate-50";
    const darkBg = index % 2 === 0 ? "bg-background" : "bg-slate-800";
    return isDark ? darkBg : lightBg;
  };

  const toggleRow = (customerId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-100/80 dark:bg-slate-900/60">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Company</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Email</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Phone</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => {
              const isExpanded = expandedRows.has(customer.id);
              const hasContacts = customer.contacts && customer.contacts.length > 0;
              
              return (
              <React.Fragment key={customer.id}>
                <TableRow className={getRowBg(index)}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(customer.id)}
                      aria-label={isExpanded ? "Collapse contacts" : "Expand contacts"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
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
                {isExpanded && (
                <TableRow className="bg-muted/30 dark:bg-slate-800/50">
                  <TableCell colSpan={7} className="py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Contacts
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (onViewContacts ? onViewContacts(customer.id) : onView(customer.id))}
                        >
                          Manage contacts
                        </Button>
                      </div>
                      {hasContacts ? (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {customer.contacts.map((contact) => (
                            <div key={contact.id} className="rounded-md border bg-background p-2">
                              <p className="text-sm font-medium">
                                {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {contact.title || contact.department || "Contact"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {contact.email || contact.phone || contact.mobile || "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No contacts added yet.</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                )}
              </React.Fragment>
            )})}
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
