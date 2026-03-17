'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditUtilizationBar } from './credit-utilization-bar';
import { formatCurrency } from '@/lib/utils/format';
import { TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

interface CreditLimit {
  id: string;
  creditLimit?: number;
  creditAmount?: number;
  utilized?: number;
  tenantId: string;
  companyId?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface CreditLimitCardProps {
  limit: CreditLimit;
  showUtilization?: boolean;
}

export function CreditLimitCard({
  limit,
  showUtilization = true,
}: CreditLimitCardProps) {
  const credit = limit.creditLimit || limit.creditAmount || 0;
  const utilized = limit.utilized || 0;
  const available = credit - utilized;
  const utilizationPercent = Math.round(
    credit > 0 ? (utilized / credit) * 100 : 0
  );

  // Determine health status
  let statusColor = 'border-l-green-500 bg-green-50';
  let statusIcon = null;
  let statusText = 'Healthy';

  if (utilizationPercent > 100) {
    statusColor = 'border-l-red-500 bg-red-50';
    statusIcon = <AlertCircle className="h-5 w-5 text-red-600" />;
    statusText = 'Exceeded';
  } else if (utilizationPercent >= 80) {
    statusColor = 'border-l-yellow-500 bg-yellow-50';
    statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    statusText = 'At Risk';
  } else if (utilizationPercent >= 50) {
    statusColor = 'border-l-blue-500 bg-blue-50';
    statusIcon = <TrendingUp className="h-5 w-5 text-blue-600" />;
    statusText = 'In Use';
  }

  return (
    <Card className={`border-l-4 ${statusColor}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Credit Limit</h3>
            <p className="text-sm text-gray-600">
              Account ID: {limit.id?.substring(0, 8)}
            </p>
          </div>
          {statusIcon && <div>{statusIcon}</div>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Credit Limit</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(credit)}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Utilized</span>
            <span className="text-lg font-semibold text-orange-600">
              {formatCurrency(utilized)}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Available</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(available)}
            </span>
          </div>
        </div>

        {showUtilization && (
          <div data-testid="utilization-bar" className="space-y-2">
            <CreditUtilizationBar
              used={utilized}
              limit={credit}
              threshold={credit * 0.8}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm text-gray-600">Status</span>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              statusText === 'Healthy'
                ? 'bg-green-100 text-green-800'
                : statusText === 'In Use'
                  ? 'bg-blue-100 text-blue-800'
                  : statusText === 'At Risk'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
            }`}
          >
            {statusText} ({utilizationPercent}%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
