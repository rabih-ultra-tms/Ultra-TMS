'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoadHistory } from '@/types/load-history';
import { getMarginColor } from '@/types/load-history';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, MapPin } from 'lucide-react';

interface LoadFinancialsSectionProps {
  load: LoadHistory;
}

export function LoadFinancialsSection({ load }: LoadFinancialsSectionProps) {
  const hasFinancials = load.customerRateCents != null || load.carrierRateCents != null;

  if (!hasFinancials) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-2">
            <DollarSign className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No financial data recorded for this load</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinancialCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Customer Rate"
          value={load.customerRateCents != null ? formatCurrency(load.customerRateCents) : '-'}
        />
        <FinancialCard
          icon={<DollarSign className="h-5 w-5 text-orange-600" />}
          label="Carrier Rate"
          value={load.carrierRateCents != null ? formatCurrency(load.carrierRateCents) : '-'}
        />
        <FinancialCard
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          label="Margin"
          value={load.marginCents != null ? formatCurrency(load.marginCents) : '-'}
          subValue={
            load.marginPercentage != null
              ? `${Number(load.marginPercentage).toFixed(1)}%`
              : undefined
          }
          subValueClassName={getMarginColor(load.marginPercentage ?? null)}
        />
        <FinancialCard
          icon={<MapPin className="h-5 w-5 text-cyan-600" />}
          label="Rate / Mile"
          value={
            load.ratePerMileCustomerCents != null
              ? `${formatCurrency(load.ratePerMileCustomerCents)}/mi`
              : load.customerRateCents != null && load.totalMiles
                ? `${formatCurrency(Math.round(load.customerRateCents / load.totalMiles))}/mi`
                : '-'
          }
          subValue={
            load.ratePerMileCarrierCents != null
              ? `Carrier: ${formatCurrency(load.ratePerMileCarrierCents)}/mi`
              : undefined
          }
        />
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {load.customerRateCents != null && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Customer Rate (Revenue)</span>
                <span className="text-sm font-medium">{formatCurrency(load.customerRateCents)}</span>
              </div>
            )}
            {load.carrierRateCents != null && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Carrier Rate (Cost)</span>
                <span className="text-sm font-medium text-muted-foreground">
                  ({formatCurrency(load.carrierRateCents)})
                </span>
              </div>
            )}
            {load.marginCents != null && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Gross Margin</span>
                <div className="text-right">
                  <span className="text-sm font-bold">{formatCurrency(load.marginCents)}</span>
                  {load.marginPercentage != null && (
                    <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${getMarginColor(load.marginPercentage)}`}>
                      {Number(load.marginPercentage).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialCard({
  icon,
  label,
  value,
  subValue,
  subValueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  subValueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subValue && (
              <p className={`text-xs font-medium mt-0.5 ${subValueClassName || 'text-muted-foreground'}`}>
                {subValue}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
