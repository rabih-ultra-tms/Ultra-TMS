'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Contract, ContractStatus } from '@/lib/api/contracts/types';
import { Download, TrendingUp, BarChart3, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContractReportsProps {
  contracts: Contract[];
  isLoading?: boolean;
}

/**
 * Contract Reports Component
 * Provides three report sections:
 * 1. Expiry Report - Contracts expiring by month
 * 2. Rate Comparison - Rate table comparison across contracts
 * 3. Volume vs Commitment - Tracking against volume commitments
 */
export function ContractReports({
  contracts,
  isLoading = false,
}: ContractReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Generate expiry report data
  const getExpiryReportData = () => {
    const monthlyExpiry: Record<string, number> = {};

    contracts.forEach((contract) => {
      if (contract.status === ContractStatus.ACTIVE) {
        const expireDate = new Date(contract.endDate);
        const monthKey = `${expireDate.getFullYear()}-${String(
          expireDate.getMonth() + 1
        ).padStart(2, '0')}`;

        monthlyExpiry[monthKey] = (monthlyExpiry[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyExpiry)
      .sort()
      .map(([month, count]) => ({
        month,
        count,
        displayMonth: new Date(`${month}-01`).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        }),
      }));
  };

  // Generate rate comparison data
  const getRateComparisonData = () => {
    return contracts.slice(0, 10).map((contract) => ({
      contractNumber: contract.contractNumber,
      partyName: contract.partyName,
      type: contract.type,
      value: contract.value,
      valuePerDay: contract.value / 365,
    }));
  };

  // Generate volume vs commitment data (mock data)
  const getVolumePerformanceData = () => {
    return contracts.slice(0, 8).map((contract) => {
      const targetVolume = Math.floor(Math.random() * 1000) + 500;
      const actualVolume = Math.floor(targetVolume * (0.7 + Math.random() * 0.3));
      const percentageOfTarget = (actualVolume / targetVolume) * 100;

      return {
        contractNumber: contract.contractNumber,
        partyName: contract.partyName,
        targetVolume,
        actualVolume,
        percentageOfTarget: Math.round(percentageOfTarget),
        status:
          percentageOfTarget >= 90
            ? 'ON_TRACK'
            : percentageOfTarget >= 70
              ? 'AT_RISK'
              : 'BEHIND',
      };
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ON_TRACK':
        return 'text-green-600 bg-green-50';
      case 'AT_RISK':
        return 'text-yellow-600 bg-yellow-50';
      case 'BEHIND':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = (data: any[], filename: string): void => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          })
          .join(',')
      ),
    ].join('\n');

    const blobData = new globalThis.Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blobData);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filename} exported successfully`);
  };

  const expiryData = getExpiryReportData();
  const rateComparisonData = getRateComparisonData();
  const volumePerformanceData = getVolumePerformanceData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="expiry" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expiry" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Expiry Report
        </TabsTrigger>
        <TabsTrigger value="rates" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Rate Comparison
        </TabsTrigger>
        <TabsTrigger value="volume" className="gap-2">
          <Volume2 className="h-4 w-4" />
          Volume Performance
        </TabsTrigger>
      </TabsList>

      {/* Expiry Report */}
      <TabsContent value="expiry">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Expiry Report</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => exportToCSV(expiryData, 'contract-expiry-report.csv')}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {expiryData.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">
                No expiry data available
              </p>
            ) : (
              <div className="space-y-4">
                {expiryData.map((item) => (
                  <div
                    key={item.month}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      setSelectedMonth(
                        selectedMonth === item.month ? null : item.month
                      )
                    }
                  >
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        {item.displayMonth}
                      </p>
                      <p className="text-xs text-text-muted">
                        {item.count} contract
                        {item.count !== 1 ? 's' : ''} expiring
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <Progress
                          value={Math.min((item.count / 10) * 100, 100)}
                          className="h-2"
                        />
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Rate Comparison */}
      <TabsContent value="rates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rate Comparison</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                exportToCSV(rateComparisonData, 'contract-rate-comparison.csv')
              }
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {rateComparisonData.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">
                No rate data available
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Annual Value</TableHead>
                      <TableHead className="text-right">Daily Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateComparisonData.map((item) => (
                      <TableRow key={item.contractNumber}>
                        <TableCell className="font-medium text-blue-600">
                          {item.contractNumber}
                        </TableCell>
                        <TableCell>{item.partyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.value)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-text-muted">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.valuePerDay)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Volume Performance */}
      <TabsContent value="volume">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Volume vs Commitment</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                exportToCSV(
                  volumePerformanceData,
                  'contract-volume-performance.csv'
                )
              }
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {volumePerformanceData.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">
                No volume data available
              </p>
            ) : (
              <div className="space-y-6">
                {volumePerformanceData.map((item) => (
                  <div key={item.contractNumber} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {item.contractNumber}
                        </p>
                        <p className="text-xs text-text-muted">
                          {item.partyName}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(item.status)} border-0`}
                      >
                        {item.percentageOfTarget}%
                      </Badge>
                    </div>
                    <Progress
                      value={Math.min(item.percentageOfTarget, 100)}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        {item.actualVolume.toLocaleString()} / target{' '}
                        {item.targetVolume.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.status === 'ON_TRACK'
                          ? 'On Track'
                          : item.status === 'AT_RISK'
                            ? 'At Risk'
                            : 'Behind'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
