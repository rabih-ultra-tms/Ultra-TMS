'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock API logs data
const mockLogs = [
  {
    id: 'log1',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    direction: 'OUTBOUND',
    method: 'GET',
    path: '/loads/search',
    url: 'https://api.dat.com/v2/loads/search?origin=Chicago&destination=LA',
    responseStatus: 200,
    responseTimeMs: 245,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 60000),
    correlationId: 'req_abc123',
    userId: 'user_001',
    requestBodySize: 0,
    responseBodySize: 15234,
  },
  {
    id: 'log2',
    integrationId: '2',
    integrationName: 'QuickBooks Online',
    direction: 'OUTBOUND',
    method: 'POST',
    path: '/invoices',
    url: 'https://quickbooks.api.intuit.com/v3/company/123/invoice',
    responseStatus: 201,
    responseTimeMs: 890,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 180000),
    correlationId: 'req_def456',
    userId: 'user_001',
    requestBodySize: 1245,
    responseBodySize: 2340,
  },
  {
    id: 'log3',
    integrationId: '3',
    integrationName: 'HubSpot CRM',
    direction: 'OUTBOUND',
    method: 'PATCH',
    path: '/contacts/123',
    url: 'https://api.hubspot.com/crm/v3/objects/contacts/123',
    responseStatus: 401,
    responseTimeMs: 120,
    status: 'FAILED',
    createdAt: new Date(Date.now() - 300000),
    correlationId: 'req_ghi789',
    userId: 'user_002',
    requestBodySize: 567,
    responseBodySize: 234,
    errorMessage: 'OAuth token expired',
  },
  {
    id: 'log4',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    direction: 'INBOUND',
    method: 'POST',
    path: '/webhooks/dat/loads',
    url: '/webhooks/dat/loads',
    responseStatus: 200,
    responseTimeMs: 45,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 420000),
    correlationId: 'wh_xyz123',
    requestBodySize: 3456,
    responseBodySize: 0,
  },
  {
    id: 'log5',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    direction: 'OUTBOUND',
    method: 'POST',
    path: '/trucks/available',
    url: 'https://api.dat.com/v2/trucks/available',
    responseStatus: 500,
    responseTimeMs: 15000,
    status: 'FAILED',
    createdAt: new Date(Date.now() - 600000),
    correlationId: 'req_jkl012',
    userId: 'user_001',
    requestBodySize: 890,
    responseBodySize: 456,
    errorMessage: 'Gateway timeout - upstream server did not respond',
  },
  {
    id: 'log6',
    integrationId: '2',
    integrationName: 'QuickBooks Online',
    direction: 'OUTBOUND',
    method: 'GET',
    path: '/customers',
    url: 'https://quickbooks.api.intuit.com/v3/company/123/query?query=select*from+Customer',
    responseStatus: 200,
    responseTimeMs: 456,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 720000),
    correlationId: 'req_mno345',
    userId: 'user_003',
    requestBodySize: 0,
    responseBodySize: 8901,
  },
];

const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  SUCCESS: 'green',
  FAILED: 'red',
  PENDING: 'yellow',
};

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 text-blue-700',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function ApiLogsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = mockLogs.filter(log => {
    const matchesIntegration = !selectedIntegration || log.integrationId === selectedIntegration;
    const matchesDirection = !selectedDirection || log.direction === selectedDirection;
    const matchesStatus = !selectedStatus || log.status === selectedStatus;
    const matchesSearch = !searchTerm || 
      log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIntegration && matchesDirection && matchesStatus && matchesSearch;
  });

  const integrations = [...new Set(mockLogs.map(l => ({ id: l.integrationId, name: l.integrationName })))];

  const stats = {
    total: mockLogs.length,
    success: mockLogs.filter(l => l.status === 'SUCCESS').length,
    failed: mockLogs.filter(l => l.status === 'FAILED').length,
    avgResponseTime: Math.round(mockLogs.reduce((sum, l) => sum + l.responseTimeMs, 0) / mockLogs.length),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Logs"
        subtitle="View and analyze API request and response logs"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Integrations
          </Button>
        </Link>
        <Button variant="outline">
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-semibold text-green-600">{stats.success}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Avg Response</p>
          <p className="text-2xl font-semibold">{stats.avgResponseTime}ms</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by path or correlation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <select
            value={selectedIntegration}
            onChange={(e) => setSelectedIntegration(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Integrations</option>
            {[...new Map(integrations.map(i => [i.id, i])).values()].map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Directions</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="INBOUND">Inbound</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </Card>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.map(log => (
          <Card 
            key={log.id} 
            className={`p-4 cursor-pointer transition-shadow hover:shadow-md ${
              log.status === 'FAILED' ? 'border-l-4 border-l-red-500' : ''
            }`}
            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Status Icon */}
                {log.status === 'SUCCESS' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}

                {/* Method Badge */}
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${methodColors[log.method]}`}>
                  {log.method}
                </span>

                {/* Direction */}
                <Badge variant={log.direction === 'INBOUND' ? 'blue' : 'gray'}>
                  {log.direction}
                </Badge>

                {/* Path */}
                <code className="text-sm text-slate-600">{log.path}</code>

                {/* Integration */}
                <span className="text-sm text-gray-500">{log.integrationName}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {/* Response Status */}
                <span className={log.responseStatus >= 400 ? 'text-red-600' : 'text-green-600'}>
                  {log.responseStatus}
                </span>

                {/* Response Time */}
                <span className={log.responseTimeMs > 1000 ? 'text-yellow-600' : ''}>
                  {log.responseTimeMs}ms
                </span>

                {/* Timestamp */}
                <span className="w-24 text-right">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedLog === log.id && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Correlation ID:</span>
                    <p className="font-mono">{log.correlationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">User:</span>
                    <p>{log.userId || 'System'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Request Size:</span>
                    <p>{log.requestBodySize} bytes</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Response Size:</span>
                    <p>{log.responseBodySize} bytes</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Full URL:</span>
                  <code className="block text-sm bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                    {log.url}
                  </code>
                </div>

                {log.errorMessage && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                    <span className="text-sm text-red-600 dark:text-red-400">{log.errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    View Request
                  </Button>
                  <Button variant="outline" size="sm">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    View Response
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Replay
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No logs found</h3>
          <p className="text-gray-500">
            Try adjusting your filters
          </p>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {mockLogs.length} logs
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
