'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PlayIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock report data
const mockReport = {
  id: '1',
  reportNumber: 'RPT-202401-0001',
  name: 'Daily Operations Summary',
  description: 'Daily load count, revenue, and performance metrics including on-time performance, carrier utilization, and customer satisfaction scores.',
  category: 'OPERATIONAL',
  reportType: 'STANDARD',
  outputFormat: 'PDF',
  isScheduled: true,
  scheduleCron: '0 6 * * *',
  nextRunAt: '2024-01-16 06:00 AM',
  recipients: ['ops-team@company.com', 'management@company.com'],
  createdBy: 'System',
  createdAt: '2023-06-15',
  lastRunAt: '2024-01-15 06:00 AM',
};

const mockExecutions = [
  { id: '1', executionNumber: 'EXE-001', startedAt: '2024-01-15 06:00 AM', completedAt: '2024-01-15 06:01 AM', status: 'COMPLETED', rowCount: 142, fileSize: '245 KB' },
  { id: '2', executionNumber: 'EXE-002', startedAt: '2024-01-14 06:00 AM', completedAt: '2024-01-14 06:01 AM', status: 'COMPLETED', rowCount: 138, fileSize: '238 KB' },
  { id: '3', executionNumber: 'EXE-003', startedAt: '2024-01-13 06:00 AM', completedAt: '2024-01-13 06:01 AM', status: 'COMPLETED', rowCount: 156, fileSize: '262 KB' },
  { id: '4', executionNumber: 'EXE-004', startedAt: '2024-01-12 06:00 AM', completedAt: '2024-01-12 06:02 AM', status: 'COMPLETED', rowCount: 145, fileSize: '251 KB' },
  { id: '5', executionNumber: 'EXE-005', startedAt: '2024-01-11 06:00 AM', completedAt: null, status: 'FAILED', error: 'Database connection timeout' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'RUNNING':
      return <Badge variant="warning">Running</Badge>;
    case 'FAILED':
      return <Badge variant="error">Failed</Badge>;
    case 'PENDING':
      return <Badge variant="default">Pending</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isRunning, setIsRunning] = useState(false);
  
  const report = mockReport;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.name}
        description={report.description}
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/reports">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <Link href={`/analytics/reports/builder?id=${report.id}`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Run Now
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Report Details</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Report Number</dt>
              <dd className="font-mono text-gray-900 dark:text-white mt-1">{report.reportNumber}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Category</dt>
              <dd className="text-gray-900 dark:text-white mt-1">{report.category}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Report Type</dt>
              <dd className="text-gray-900 dark:text-white mt-1">{report.reportType}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Output Format</dt>
              <dd className="mt-1">
                <Badge variant="success">{report.outputFormat}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created By</dt>
              <dd className="text-gray-900 dark:text-white mt-1">{report.createdBy}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created Date</dt>
              <dd className="text-gray-900 dark:text-white mt-1">{report.createdAt}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Schedule</h3>
          {report.isScheduled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-green-500" />
                <Badge variant="success">Scheduled</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Run</p>
                <p className="font-medium text-gray-900 dark:text-white">{report.nextRunAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{report.scheduleCron}</p>
                <p className="text-xs text-gray-500 mt-1">Daily at 6:00 AM</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recipients</p>
                <div className="mt-1 space-y-1">
                  {report.recipients.map((email) => (
                    <p key={email} className="text-sm text-gray-900 dark:text-white">{email}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500">Manual execution only</span>
            </div>
          )}
        </Card>
      </div>

      {/* Execution History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Execution History</h3>
          <span className="text-sm text-slate-500">Last 5 executions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Execution
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Rows
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockExecutions.map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {execution.status === 'COMPLETED' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                      {execution.status === 'FAILED' && <XCircleIcon className="h-4 w-4 text-red-500" />}
                      <span className="font-mono text-sm">{execution.executionNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {execution.startedAt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {execution.completedAt ?? '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {getStatusBadge(execution.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    {execution.rowCount?.toLocaleString() ?? '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                    {execution.fileSize ?? '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {execution.status === 'COMPLETED' && (
                      <Button variant="ghost" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    )}
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
