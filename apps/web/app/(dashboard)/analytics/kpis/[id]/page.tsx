'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock KPI detail data
const mockKpiDetail = {
  id: '8',
  code: 'ON_TIME_DELIVERY',
  name: 'On-Time Delivery %',
  description: 'Percentage of loads delivered within the scheduled delivery window',
  category: 'OPERATIONAL',
  dataSource: 'loads',
  aggregationType: 'AVG',
  unit: '%',
  formatPattern: '0.0%',
  targetValue: 95,
  warningThreshold: 93,
  criticalThreshold: 90,
  thresholdDirection: 'BELOW',
  currentValue: 94.2,
  previousValue: 96.1,
  status: 'CRITICAL',
  calculatedAt: '2024-01-15 10:00 AM',
  isSystem: true,
};

const mockHistory = [
  { period: '2024-01-15', value: 94.2, target: 95, status: 'CRITICAL' },
  { period: '2024-01-14', value: 95.1, target: 95, status: 'NORMAL' },
  { period: '2024-01-13', value: 96.5, target: 95, status: 'NORMAL' },
  { period: '2024-01-12', value: 94.8, target: 95, status: 'WARNING' },
  { period: '2024-01-11', value: 95.5, target: 95, status: 'NORMAL' },
  { period: '2024-01-10', value: 96.1, target: 95, status: 'NORMAL' },
  { period: '2024-01-09', value: 95.8, target: 95, status: 'NORMAL' },
  { period: '2024-01-08', value: 94.5, target: 95, status: 'WARNING' },
  { period: '2024-01-07', value: 95.2, target: 95, status: 'NORMAL' },
  { period: '2024-01-06', value: 96.0, target: 95, status: 'NORMAL' },
];

const mockBreakdown = [
  { dimension: 'TL', value: 95.8, count: 85 },
  { dimension: 'LTL', value: 92.5, count: 42 },
  { dimension: 'Intermodal', value: 94.0, count: 10 },
  { dimension: 'Expedited', value: 98.2, count: 5 },
];

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'NORMAL': return 'success';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
}

export default function KpiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const kpi = mockKpiDetail;
  
  const changePercent = ((kpi.currentValue - kpi.previousValue) / kpi.previousValue) * 100;
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={kpi.name}
        description={kpi.description}
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/kpis">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <BellIcon className="h-4 w-4 mr-1" />
              Set Alert
            </Button>
            <Button variant="outline" size="sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        }
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Value</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {kpi.currentValue.toFixed(1)}%
              </p>
              <div className="flex items-center gap-2 mt-2">
                {isPositive && <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />}
                {isNegative && <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />}
                {!isPositive && !isNegative && <MinusIcon className="h-5 w-5 text-gray-400" />}
                <span className={`font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}% vs yesterday
                </span>
              </div>
            </div>
            <Badge variant={getStatusColor(kpi.status)} size="lg">{kpi.status}</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-500 mb-1">Target</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.targetValue}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {kpi.currentValue >= kpi.targetValue ? 'Above target ✓' : `${(kpi.targetValue - kpi.currentValue).toFixed(1)}% below target`}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-500 mb-1">Thresholds</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-yellow-600">Warning</span>
              <span className="text-sm font-medium">&lt; {kpi.warningThreshold}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-600">Critical</span>
              <span className="text-sm font-medium">&lt; {kpi.criticalThreshold}%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart Placeholder */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trend (Last 10 Days)</h2>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
          {/* Simple data table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Value</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.slice(0, 5).map((row) => (
                  <tr key={row.period} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2">{row.period}</td>
                    <td className="py-2 text-right font-medium">{row.value.toFixed(1)}%</td>
                    <td className="py-2 text-center">
                      <Badge variant={getStatusColor(row.status)} size="sm">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Breakdown by Mode</h2>
          <div className="space-y-4">
            {mockBreakdown.map((item) => {
              const barWidth = (item.value / 100) * 100;
              const isAboveTarget = item.value >= kpi.targetValue;
              return (
                <div key={item.dimension}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.dimension}</span>
                    <span className={isAboveTarget ? 'text-green-600' : 'text-red-600'}>
                      {item.value.toFixed(1)}% ({item.count} loads)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isAboveTarget ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KPI Details</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-500">Code</dt>
              <dd className="font-mono text-gray-900 dark:text-white">{kpi.code}</dd>
              <dt className="text-gray-500">Category</dt>
              <dd className="text-gray-900 dark:text-white">{kpi.category}</dd>
              <dt className="text-gray-500">Data Source</dt>
              <dd className="text-gray-900 dark:text-white">{kpi.dataSource}</dd>
              <dt className="text-gray-500">Aggregation</dt>
              <dd className="text-gray-900 dark:text-white">{kpi.aggregationType}</dd>
              <dt className="text-gray-500">Last Calculated</dt>
              <dd className="text-gray-900 dark:text-white">{kpi.calculatedAt}</dd>
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900 dark:text-white">{kpi.isSystem ? 'System' : 'Custom'}</dd>
            </dl>
          </div>
        </Card>
      </div>
    </div>
  );
}
