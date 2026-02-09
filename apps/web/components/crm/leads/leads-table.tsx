"use client";

import { useState } from "react";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Trash2 } from "lucide-react";
import type { Lead } from "@/lib/types/crm";
import { LeadStageBadge } from "./lead-stage-badge";

interface LeadsTableProps {
  leads: Lead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onView: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export function LeadsTable({
  leads,
  pagination,
  onPageChange,
  onView,
  onDelete,
  isLoading,
  isDeleting,
}: LeadsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId && onDelete) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company?.name || "—"}</TableCell>
                <TableCell>
                  <LeadStageBadge stage={lead.stage} />
                </TableCell>
                <TableCell>{lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : "Unassigned"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(lead.id)}
                      disabled={isLoading}
                    >
                      View
                    </Button>
                    {onDelete ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(lead.id)}
                        disabled={isLoading || isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
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
      <ConfirmDialog
        open={!!deleteId}
        title="Delete deal"
        description="This action cannot be undone. The deal will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
        destructive
      />
    </div>
  );
}
