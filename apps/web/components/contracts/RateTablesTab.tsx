'use client';

import { useState } from 'react';
import { RateTable } from '@/lib/api/contracts/types';
import { rateTablesApi } from '@/lib/api/contracts/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Plus, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface RateTablesTabProps {
  rateTables: RateTable[];
  contractId: string;
}

export default function RateTablesTab({
  rateTables,
}: RateTablesTabProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportCSV = async (tableId: string) => {
    try {
      setExporting(tableId);
      const blob = await rateTablesApi.exportCSV(tableId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rate-table-${tableId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Rate table exported successfully');
    } catch (_error) {
      toast.error('Failed to export rate table');
    } finally {
      setExporting(null);
    }
  };

  if (!rateTables || rateTables.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-4 text-sm text-text-muted">
            No rate tables configured yet
          </p>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Rate Table
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rate Tables</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Add Rate Table
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rateTables.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>{table.type}</TableCell>
                <TableCell>
                  {new Date(table.effectiveDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(table.expiryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{table.baseCurrency}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Download className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportCSV(table.id)}
                        disabled={exporting === table.id}
                        className="gap-2"
                      >
                        <Download className="size-4" />
                        {exporting === table.id ? 'Exporting...' : 'Export CSV'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
