'use client';

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useSettlementHistory } from '@/lib/hooks/carrier/use-payments';

interface SettlementHistoryProps {
  limit?: number;
}

export function SettlementHistory({ limit = 10 }: SettlementHistoryProps) {
  const {
    data: settlements = [],
    isLoading,
    error,
  } = useSettlementHistory({ limit });

  const sortedSettlements = useMemo(() => {
    return [...(settlements || [])].sort(
      (a, b) =>
        new Date(b.settlementDate).getTime() -
        new Date(a.settlementDate).getTime()
    );
  }, [settlements]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">
            Error Loading Settlements
          </h3>
          <p className="text-sm text-red-800 mt-1">
            {error instanceof Error
              ? error.message
              : 'Failed to load settlement history'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600">Loading settlements...</p>
            </div>
          ) : sortedSettlements.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <p>No settlements found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-slate-700 font-semibold">
                    Settlement Period
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Total Amount
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Deductions
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Net Amount
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSettlements.map((settlement) => (
                  <TableRow
                    key={settlement.id}
                    className="hover:bg-slate-50 border-b border-slate-200 last:border-0"
                  >
                    <TableCell className="font-medium text-slate-900">
                      {settlement.settlementNumber}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatCurrency(settlement.grossAmount)}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatCurrency(settlement.deductionsTotal)}
                    </TableCell>
                    <TableCell className="text-slate-700 font-semibold">
                      {formatCurrency(settlement.netAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(settlement.status)} border-0`}
                      >
                        {settlement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatDate(settlement.settlementDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
