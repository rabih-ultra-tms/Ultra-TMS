'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  ArrowPathIcon,
  PlayIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock sync jobs
const mockSyncJobs = [
  {
    id: '1',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    integrationLogo: '🚚',
    type: 'FULL_SYNC',
    status: 'RUNNING',
    progress: 67,
    startedAt: new Date(Date.now() - 1800000),
    recordsProcessed: 450,
    totalRecords: 670,
    errors: [],
  },
  {
    id: '2',
    integrationId: '2',
    integrationName: 'QuickBooks Online',
    integrationLogo: '💰',
    type: 'INCREMENTAL_SYNC',
    status: 'COMPLETED',
    progress: 100,
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3500000),
    recordsProcessed: 23,
    totalRecords: 23,
    errors: [],
  },
  {
    id: '3',
    integrationId: '3',
    integrationName: 'HubSpot CRM',
    integrationLogo: '🎯',
    type: 'CONTACTS_IMPORT',
    status: 'FAILED',
    progress: 34,
    startedAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 7100000),
    recordsProcessed: 128,
    totalRecords: 380,
    errors: [
      { code: 'AUTH_EXPIRED', message: 'OAuth token expired. Please re-authenticate.' },
    ],
  },
  {
    id: '4',
    integrationId: '4',
    integrationName: 'Samsara ELD',
    integrationLogo: '📍',
    type: 'VEHICLES_SYNC',
    status: 'COMPLETED',
    progress: 100,
    startedAt: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 86300000),
    recordsProcessed: 45,
    totalRecords: 45,
    errors: [],
  },
  {
    id: '5',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    integrationLogo: '🚚',
    type: 'INCREMENTAL_SYNC',
    status: 'PENDING',
    progress: 0,
    scheduledFor: new Date(Date.now() + 3600000),
    recordsProcessed: 0,
    totalRecords: 0,
    errors: [],
  },
  {
    id: '6',
    integrationId: '1',
    integrationName: 'DAT Load Board',
    integrationLogo: '🚚',
    type: 'INCREMENTAL_SYNC',
    status: 'COMPLETED',
    progress: 100,
    startedAt: new Date(Date.now() - 172800000),
    completedAt: new Date(Date.now() - 172700000),
    recordsProcessed: 890,
    totalRecords: 890,
    errors: [],
  },
];

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'; icon: React.ComponentType<{ className?: string }> }> = {
  COMPLETED: { color: 'green', icon: CheckCircleIcon },
  RUNNING: { color: 'blue', icon: ArrowPathIcon },
  FAILED: { color: 'red', icon: XCircleIcon },
  PENDING: { color: 'gray', icon: ClockIcon },
  CANCELLED: { color: 'yellow', icon: ExclamationTriangleIcon },
};

const typeLabels: Record<string, string> = {
  FULL_SYNC: 'Full Sync',
  INCREMENTAL_SYNC: 'Incremental',
  CONTACTS_IMPORT: 'Contacts Import',
  VEHICLES_SYNC: 'Vehicles Sync',
  LOADS_IMPORT: 'Loads Import',
  INVOICES_SYNC: 'Invoices Sync',
};

export default function SyncJobsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [integrationFilter, setIntegrationFilter] = useState<string>('all');

  const filteredJobs = mockSyncJobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (integrationFilter !== 'all' && job.integrationId !== integrationFilter) return false;
    return true;
  });

  const stats = {
    total: mockSyncJobs.length,
    running: mockSyncJobs.filter(j => j.status === 'RUNNING').length,
    completed: mockSyncJobs.filter(j => j.status === 'COMPLETED').length,
    failed: mockSyncJobs.filter(j => j.status === 'FAILED').length,
    pending: mockSyncJobs.filter(j => j.status === 'PENDING').length,
  };

  const integrations = [...new Map(mockSyncJobs.map(j => [j.integrationId, { id: j.integrationId, name: j.integrationName }])).values()];

  const getDuration = (job: typeof mockSyncJobs[0]) => {
    if (!job.startedAt) return '-';
    const end = job.completedAt || new Date();
    const seconds = Math.floor((end.getTime() - job.startedAt.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sync Jobs"
        subtitle="Monitor and manage data synchronization jobs"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Integrations
          </Button>
        </Link>
        <Button>
          <PlayIcon className="h-4 w-4 mr-2" />
          Start New Sync
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Running</p>
          <p className="text-3xl font-bold text-blue-600">{stats.running}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-gray-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Integrations</option>
            {integrations.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          <div className="flex-1" />

          <Button variant="outline" size="sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <ArrowPathIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sync jobs found</h3>
            <p className="text-gray-500">No jobs match your current filters.</p>
          </Card>
        ) : (
          filteredJobs.map(job => {
            const config = statusConfig[job.status]!;
            const StatusIcon = config.icon;
            
            return (
              <Card key={job.id} className={`p-6 ${
                job.status === 'FAILED' ? 'border-red-300 dark:border-red-800' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{job.integrationLogo}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{job.integrationName}</h3>
                        <Badge variant="gray">{typeLabels[job.type] || job.type}</Badge>
                        <Badge variant={config.color}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${job.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Job ID: {job.id}
                        {job.startedAt && ` • Started ${job.startedAt.toLocaleString()}`}
                        {job.scheduledFor && ` • Scheduled for ${job.scheduledFor.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === 'RUNNING' && (
                      <Button variant="danger" size="sm">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {job.status === 'FAILED' && (
                      <Button variant="outline" size="sm">
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(job.status === 'RUNNING' || job.status === 'FAILED') && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span>{job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()} records</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          job.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{job.progress}% complete</p>
                  </div>
                )}

                {/* Stats for Completed */}
                {job.status === 'COMPLETED' && (
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>{job.recordsProcessed.toLocaleString()} records processed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>Duration: {getDuration(job)}</span>
                    </div>
                    {job.completedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Completed {job.completedAt.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Errors */}
                {job.errors.length > 0 && (
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    {job.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-600 dark:text-red-400">{error.code}</p>
                          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
