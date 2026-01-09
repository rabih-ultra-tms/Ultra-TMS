'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock dashboard data
const mockDashboard = {
  id: '1',
  name: 'Executive Overview',
  slug: 'executive-overview',
  description: 'High-level view of company performance',
  ownerType: 'SYSTEM',
  theme: 'LIGHT',
  refreshInterval: 300,
  lastRefreshed: '2024-01-15 10:45 AM',
};

const mockWidgetData = [
  { id: '1', type: 'KPI_CARD', title: 'Revenue MTD', value: 1250000, unit: 'USD', change: 5.9, status: 'NORMAL' },
  { id: '2', type: 'KPI_CARD', title: 'Loads Today', value: 142, unit: '', change: 5.2, status: 'NORMAL' },
  { id: '3', type: 'KPI_CARD', title: 'On-Time %', value: 94.2, unit: '%', change: -1.9, status: 'CRITICAL' },
  { id: '4', type: 'KPI_CARD', title: 'Margin %', value: 18.5, unit: '%', change: 1.3, status: 'WARNING' },
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

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'NORMAL': return 'success';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
}

export default function DashboardViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const dashboard = mockDashboard;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboard.name}
        description={dashboard.description}
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/dashboards">
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
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href={`/analytics/dashboards/builder?id=${dashboard.id}`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <ShareIcon className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        }
      />

      {/* Dashboard Info Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span>Last refreshed: {dashboard.lastRefreshed}</span>
            <span>•</span>
            <span>Auto-refresh: {dashboard.refreshInterval}s</span>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockWidgetData.map((widget) => (
          <Card key={widget.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-500">{widget.title}</p>
              <Badge variant={getStatusColor(widget.status)} size="sm">{widget.status}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(widget.value, widget.unit)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className={`h-4 w-4 ${widget.change > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${widget.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {widget.change > 0 ? '+' : ''}{widget.change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs prior</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <Button variant="ghost" size="sm">
              <ChartBarIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Line chart visualization</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Load Volume by Mode</h3>
            <Button variant="ghost" size="sm">
              <ChartBarIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Bar chart visualization</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Customers</h3>
            <Button variant="ghost" size="sm">
              <TableCellsIcon className="h-4 w-4" />
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2">Customer</th>
                <th className="pb-2 text-right">Revenue</th>
                <th className="pb-2 text-right">Loads</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">ABC Manufacturing</td>
                <td className="py-2 text-right">$245,000</td>
                <td className="py-2 text-right">52</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">XYZ Distribution</td>
                <td className="py-2 text-right">$198,500</td>
                <td className="py-2 text-right">45</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">Global Retail Inc</td>
                <td className="py-2 text-right">$175,200</td>
                <td className="py-2 text-right">38</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">Metro Foods</td>
                <td className="py-2 text-right">$142,800</td>
                <td className="py-2 text-right">31</td>
              </tr>
              <tr>
                <td className="py-2">Tech Solutions</td>
                <td className="py-2 text-right">$128,000</td>
                <td className="py-2 text-right">28</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue by Region</h3>
            <Button variant="ghost" size="sm">
              <ChartBarIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Pie chart visualization</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
