import { Contract, ContractStatus } from '@/lib/api/contracts/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Calendar, AlertCircle, DollarSign } from 'lucide-react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function isExpiringWithin30Days(endDate: string): boolean {
  const today = new Date();
  const expireDate = new Date(endDate);
  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 30;
}

function isExpired(contract: {
  status: ContractStatus;
  endDate: string;
}): boolean {
  return (
    contract.status === ContractStatus.TERMINATED ||
    new Date(contract.endDate) < new Date()
  );
}

interface ContractsDashboardStatsProps {
  contracts?: Contract[];
  isLoading?: boolean;
}

export function ContractsDashboardStats({
  contracts = [],
  isLoading = false,
}: ContractsDashboardStatsProps) {
  const activeContracts = contracts.filter(
    (c) => c.status === ContractStatus.ACTIVE
  ).length;

  const expiringContracts = contracts.filter(
    (c) =>
      c.status === ContractStatus.ACTIVE && isExpiringWithin30Days(c.endDate)
  ).length;

  const expiredContracts = contracts.filter((c) => isExpired(c)).length;

  const totalRevenue = contracts.reduce(
    (sum, contract) => sum + (contract.value || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Active Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Contracts
          </CardTitle>
          <CheckCircle className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="mt-1 text-xs text-text-muted">
                Currently in effect
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <Calendar className="size-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{expiringContracts}</div>
              <p className="mt-1 text-xs text-text-muted">Within 30 days</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Expired */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired</CardTitle>
          <AlertCircle className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold">{expiredContracts}</div>
              <p className="mt-1 text-xs text-text-muted">
                Terminated or past end date
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Revenue Under Contract */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Revenue Under Contract
          </CardTitle>
          <DollarSign className="size-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Total contract value
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
