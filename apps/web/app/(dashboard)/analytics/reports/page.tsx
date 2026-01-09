'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentChartBarIcon,
  PlayIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

const reportCategories = [
  { id: 'ALL', name: 'All Reports', count: 25 },
  { id: 'OPERATIONAL', name: 'Operational', count: 8 },
  { id: 'FINANCIAL', name: 'Financial', count: 6 },
  { id: 'CARRIER', name: 'Carrier', count: 4 },
  { id: 'CUSTOMER', name: 'Customer', count: 4 },
  { id: 'SALES', name: 'Sales', count: 3 },
];

const mockReports = [
  { 
    id: '1', 
    reportNumber: 'RPT-202401-0001',
    name: 'Daily Operations Summary', 
    category: 'OPERATIONAL',
    description: 'Daily load count, revenue, and performance metrics',
    isScheduled: true,
    scheduleCron: '0 6 * * *',
    lastRun: '2024-01-15 06:00 AM',
    nextRun: '2024-01-16 06:00 AM',
    outputFormat: 'PDF',
  },
  { 
    id: '2', 
    reportNumber: 'RPT-202401-0002',
    name: 'Weekly Revenue Report', 
    category: 'FINANCIAL',
    description: 'Week-over-week revenue and margin analysis',
    isScheduled: true,
    scheduleCron: '0 9 * * 1',
    lastRun: '2024-01-14 09:00 AM',
    nextRun: '2024-01-21 09:00 AM',
    outputFormat: 'EXCEL',
  },
  { 
    id: '3', 
    reportNumber: 'RPT-202401-0003',
    name: 'Carrier Performance Scorecard', 
    category: 'CARRIER',
    description: 'Carrier ratings, on-time performance, and compliance',
    isScheduled: true,
    scheduleCron: '0 17 * * 5',
    lastRun: '2024-01-12 05:00 PM',
    nextRun: '2024-01-19 05:00 PM',
    outputFormat: 'PDF',
  },
  { 
    id: '4', 
    reportNumber: 'RPT-202401-0004',
    name: 'Customer Profitability Analysis', 
    category: 'CUSTOMER',
    description: 'Revenue and margin by customer with trend analysis',
    isScheduled: false,
    lastRun: '2024-01-10 03:00 PM',
    outputFormat: 'EXCEL',
  },
  { 
    id: '5', 
    reportNumber: 'RPT-202401-0005',
    name: 'Monthly P&L Statement', 
    category: 'FINANCIAL',
    description: 'Profit and loss with departmental breakdown',
    isScheduled: true,
    scheduleCron: '0 8 1 * *',
    lastRun: '2024-01-01 08:00 AM',
    nextRun: '2024-02-01 08:00 AM',
    outputFormat: 'PDF',
  },
  { 
    id: '6', 
    reportNumber: 'RPT-202401-0006',
    name: 'Sales Pipeline Report', 
    category: 'SALES',
    description: 'Open quotes, conversion rates, and forecast',
    isScheduled: true,
    scheduleCron: '0 9 * * 1',
    lastRun: '2024-01-14 09:00 AM',
    nextRun: '2024-01-21 09:00 AM',
    outputFormat: 'PDF',
  },
  { 
    id: '7', 
    reportNumber: 'RPT-202401-0007',
    name: 'Load Detail Export', 
    category: 'OPERATIONAL',
    description: 'Detailed load data with all stops and charges',
    isScheduled: false,
    lastRun: '2024-01-13 02:00 PM',
    outputFormat: 'CSV',
  },
  { 
    id: '8', 
    reportNumber: 'RPT-202401-0008',
    name: 'Accounts Receivable Aging', 
    category: 'FINANCIAL',
    description: 'Outstanding invoices by aging bucket',
    isScheduled: true,
    scheduleCron: '0 8 * * *',
    lastRun: '2024-01-15 08:00 AM',
    nextRun: '2024-01-16 08:00 AM',
    outputFormat: 'EXCEL',
  },
];

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

function getFormatBadgeColor(format: string): 'success' | 'warning' | 'default' {
  switch (format) {
    case 'PDF': return 'success';
    case 'EXCEL': return 'warning';
    default: return 'default';
  }
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);

  const filteredReports = mockReports.filter((report) => {
    if (selectedCategory !== 'ALL' && report.category !== selectedCategory) return false;
    if (searchQuery && !report.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (showScheduledOnly && !report.isScheduled) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate, schedule, and view reports"
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/reports/builder">
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                New Report
              </Button>
            </Link>
            <Button variant="primary" size="sm">
              <PlayIcon className="h-4 w-4 mr-1" />
              Quick Run
            </Button>
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {reportCategories.map((category) => (
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Button
          variant={showScheduledOnly ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowScheduledOnly(!showScheduledOnly)}
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          Scheduled Only
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <DocumentChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.reportNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                      {report.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {report.isScheduled ? (
                      <div className="flex flex-col items-center">
                        <Badge variant="success" size="sm">Scheduled</Badge>
                        {report.nextRun && (
                          <span className="text-xs text-slate-500 mt-1">
                            Next: {report.nextRun}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="default" size="sm">Manual</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      {report.lastRun}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge variant={getFormatBadgeColor(report.outputFormat)} size="sm">
                      {report.outputFormat}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="primary" size="sm">
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Link href={`/analytics/reports/${report.id}`}>
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/analytics/reports/builder?id=${report.id}`}>
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </div>
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
