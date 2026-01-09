'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

const kpiCategories = [
  { id: 'ALL', name: 'All Categories', count: 54 },
  { id: 'FINANCIAL', name: 'Financial', count: 12 },
  { id: 'OPERATIONAL', name: 'Operational', count: 18 },
  { id: 'CARRIER', name: 'Carrier', count: 10 },
  { id: 'CUSTOMER', name: 'Customer', count: 8 },
  { id: 'SALES', name: 'Sales', count: 6 },
];

const mockKpis = [
  { id: '1', code: 'REVENUE_MTD', name: 'Revenue MTD', category: 'FINANCIAL', value: 1250000, target: 1500000, unit: 'USD', status: 'NORMAL', change: 5.9, isSystem: true },
  { id: '2', code: 'REVENUE_YTD', name: 'Revenue YTD', category: 'FINANCIAL', value: 14520000, target: 18000000, unit: 'USD', status: 'NORMAL', change: 12.3, isSystem: true },
  { id: '3', code: 'GROSS_MARGIN', name: 'Gross Margin %', category: 'FINANCIAL', value: 18.5, target: 20, unit: '%', status: 'WARNING', change: 1.3, isSystem: true },
  { id: '4', code: 'NET_MARGIN', name: 'Net Margin %', category: 'FINANCIAL', value: 8.2, target: 10, unit: '%', status: 'WARNING', change: -0.5, isSystem: true },
  { id: '5', code: 'LOADS_TODAY', name: 'Loads Today', category: 'OPERATIONAL', value: 142, target: 150, unit: '', status: 'NORMAL', change: 5.2, isSystem: true },
  { id: '6', code: 'LOADS_MTD', name: 'Loads MTD', category: 'OPERATIONAL', value: 2840, target: 3000, unit: '', status: 'NORMAL', change: 8.1, isSystem: true },
  { id: '7', code: 'ON_TIME_PICKUP', name: 'On-Time Pickup %', category: 'OPERATIONAL', value: 96.5, target: 95, unit: '%', status: 'NORMAL', change: 0.8, isSystem: true },
  { id: '8', code: 'ON_TIME_DELIVERY', name: 'On-Time Delivery %', category: 'OPERATIONAL', value: 94.2, target: 95, unit: '%', status: 'CRITICAL', change: -1.9, isSystem: true },
  { id: '9', code: 'CARRIER_SCORE_AVG', name: 'Avg Carrier Score', category: 'CARRIER', value: 4.2, target: 4.0, unit: '', status: 'NORMAL', change: 2.4, isSystem: true },
  { id: '10', code: 'CARRIER_COMPLIANCE', name: 'Carrier Compliance %', category: 'CARRIER', value: 98.1, target: 98, unit: '%', status: 'NORMAL', change: 0.3, isSystem: true },
  { id: '11', code: 'CARRIER_TENDER_ACCEPT', name: 'Tender Accept Rate', category: 'CARRIER', value: 85.5, target: 88, unit: '%', status: 'WARNING', change: -2.1, isSystem: true },
  { id: '12', code: 'CUSTOMER_RETENTION', name: 'Customer Retention', category: 'CUSTOMER', value: 92.5, target: 90, unit: '%', status: 'NORMAL', change: 0.7, isSystem: true },
  { id: '13', code: 'CUSTOMER_NPS', name: 'Net Promoter Score', category: 'CUSTOMER', value: 42, target: 40, unit: '', status: 'NORMAL', change: 5.0, isSystem: true },
  { id: '14', code: 'AVG_RESPONSE_TIME', name: 'Avg Response Time', category: 'CUSTOMER', value: 25, target: 30, unit: 'min', status: 'NORMAL', change: -8.3, isSystem: true },
  { id: '15', code: 'QUOTE_CONVERSION', name: 'Quote Conversion %', category: 'SALES', value: 28.5, target: 30, unit: '%', status: 'WARNING', change: -1.5, isSystem: true },
  { id: '16', code: 'NEW_CUSTOMERS_MTD', name: 'New Customers MTD', category: 'SALES', value: 12, target: 15, unit: '', status: 'WARNING', change: -20.0, isSystem: true },
];

function formatValue(value: number, unit: string): string {
  if (unit === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'min') {
    return `${value} min`;
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

function getCategoryColor(category: string): string {
  switch (category) {
    case 'FINANCIAL': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'OPERATIONAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 text-blue-700';
    case 'CARRIER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'CUSTOMER': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SALES': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800';
  }
}

export default function KpisPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKpis = mockKpis.filter((kpi) => {
    if (selectedCategory !== 'ALL' && kpi.category !== selectedCategory) return false;
    if (searchQuery && !kpi.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Overview"
        description="Monitor and track key performance indicators across your business"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FunnelIcon className="h-4 w-4 mr-1" />
              Configure
            </Button>
            <Button variant="primary" size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Custom KPI
            </Button>
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {kpiCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search KPIs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
        />
      </div>

      {/* KPI Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  KPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredKpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ChartBarIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{kpi.name}</p>
                        <p className="text-xs text-gray-500">{kpi.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(kpi.category)}`}>
                      {kpi.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatValue(kpi.value, kpi.unit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-500">
                      {formatValue(kpi.target, kpi.unit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {kpi.change > 0 && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                      {kpi.change < 0 && <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />}
                      {kpi.change === 0 && <MinusIcon className="h-4 w-4 text-gray-400" />}
                      <span className={`text-sm font-medium ${kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge variant={getStatusColor(kpi.status)}>{kpi.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/analytics/kpis/${kpi.id}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
