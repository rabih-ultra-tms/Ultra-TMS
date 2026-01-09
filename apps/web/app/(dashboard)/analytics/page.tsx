'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  BellAlertIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock KPI data
const mockKpis = [
  { 
    id: '1', 
    code: 'REVENUE_MTD', 
    name: 'Revenue MTD', 
    category: 'FINANCIAL',
    value: 1250000, 
    previousValue: 1180000,
    target: 1500000, 
    unit: 'USD',
    status: 'NORMAL',
  },
  { 
    id: '2', 
    code: 'MARGIN_PERCENT', 
    name: 'Gross Margin %', 
    category: 'FINANCIAL',
    value: 18.5, 
    previousValue: 17.2,
    target: 20, 
    unit: '%',
    status: 'WARNING',
  },
  { 
    id: '3', 
    code: 'LOADS_TODAY', 
    name: 'Loads Today', 
    category: 'OPERATIONAL',
    value: 142, 
    previousValue: 135,
    target: 150, 
    unit: '',
    status: 'NORMAL',
  },
  { 
    id: '4', 
    code: 'ON_TIME_PERCENT', 
    name: 'On-Time Delivery %', 
    category: 'OPERATIONAL',
    value: 94.2, 
    previousValue: 96.1,
    target: 95, 
    unit: '%',
    status: 'CRITICAL',
  },
  { 
    id: '5', 
    code: 'CARRIER_SCORE_AVG', 
    name: 'Avg Carrier Score', 
    category: 'CARRIER',
    value: 4.2, 
    previousValue: 4.1,
    target: 4.0, 
    unit: '',
    status: 'NORMAL',
  },
  { 
    id: '6', 
    code: 'CUSTOMER_RETENTION', 
    name: 'Customer Retention', 
    category: 'CUSTOMER',
    value: 92.5, 
    previousValue: 91.8,
    target: 90, 
    unit: '%',
    status: 'NORMAL',
  },
];

const mockAlerts = [
  { id: '1', kpiName: 'On-Time Delivery %', type: 'CRITICAL', message: 'Dropped below 95% threshold', createdAt: '10 min ago' },
  { id: '2', kpiName: 'Claims Ratio', type: 'WARNING', message: 'Approaching 2% threshold', createdAt: '45 min ago' },
  { id: '3', kpiName: 'Response Time', type: 'WARNING', message: 'Above target by 5 min', createdAt: '2 hrs ago' },
];

const quickReports = [
  { id: '1', name: 'Daily Operations Summary', lastRun: '2024-01-15 06:00 AM' },
  { id: '2', name: 'Weekly Revenue Report', lastRun: '2024-01-14 09:00 AM' },
  { id: '3', name: 'Carrier Performance', lastRun: '2024-01-13 05:00 PM' },
  { id: '4', name: 'Customer Profitability', lastRun: '2024-01-12 03:00 PM' },
];

function formatValue(value: number, unit: string): string {
  if (unit === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'NORMAL': return 'success';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('MTD');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reporting"
        description="Monitor KPIs, view dashboards, and generate reports"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {selectedPeriod}
            </Button>
            <Button variant="outline" size="sm">
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Link href="/analytics/dashboards/builder">
              <Button variant="primary" size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                New Dashboard
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/analytics/kpis" className="group">
          <Card className="p-4 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">KPI Overview</h3>
                <p className="text-sm text-gray-500">50+ active metrics</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/analytics/dashboards" className="group">
          <Card className="p-4 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TableCellsIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dashboards</h3>
                <p className="text-sm text-gray-500">8 custom dashboards</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/analytics/reports" className="group">
          <Card className="p-4 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DocumentChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Reports</h3>
                <p className="text-sm text-gray-500">25 report templates</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/analytics/alerts" className="group">
          <Card className="p-4 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <BellAlertIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Alerts</h3>
                <p className="text-sm text-gray-500">3 active alerts</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Performance Indicators</h2>
          <Link href="/analytics/kpis" className="text-sm text-blue-600 hover:text-blue-700">
            View all KPIs →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockKpis.map((kpi) => {
            const changePercent = getChangePercent(kpi.value, kpi.previousValue);
            const isPositive = changePercent > 0;
            const isNegative = changePercent < 0;
            
            return (
              <Card key={kpi.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatValue(kpi.value, kpi.unit)}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(kpi.status)}>{kpi.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    {isPositive && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                    {isNegative && <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />}
                    {!isPositive && !isNegative && <MinusIcon className="h-4 w-4 text-gray-400" />}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs prior</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {formatValue(kpi.target, kpi.unit)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h2>
            <Link href="/analytics/alerts" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`p-1.5 rounded-full ${alert.type === 'CRITICAL' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <BellAlertIcon className={`h-4 w-4 ${alert.type === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.kpiName}</p>
                  <p className="text-xs text-gray-500 truncate">{alert.message}</p>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant={alert.type === 'CRITICAL' ? 'error' : 'warning'} size="sm">
                    {alert.type}
                  </Badge>
                  <span className="text-xs text-gray-400 mt-1">{alert.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
            <Link href="/analytics/reports" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {quickReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-center gap-3">
                  <DocumentChartBarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                    <p className="text-xs text-gray-500">Last run: {report.lastRun}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Run</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
