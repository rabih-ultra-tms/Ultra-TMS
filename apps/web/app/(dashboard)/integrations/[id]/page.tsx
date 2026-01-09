'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeftIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  KeyIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock integration detail
const mockIntegration = {
  id: '1',
  name: 'DAT Load Board',
  providerCode: 'DAT',
  logo: '🚚',
  status: 'ACTIVE',
  description: 'Access over 500 million loads annually with real-time freight matching.',
  category: 'Load Boards',
  authType: 'API_KEY',
  connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  lastSyncAt: new Date(Date.now() - 3600000),
  syncFrequency: 'HOURLY',
  webhooksEnabled: true,
  settings: {
    autoPost: true,
    loadRadius: 150,
    equipmentTypes: ['DRY_VAN', 'REEFER', 'FLATBED'],
    minRating: 3.5,
  },
  health: {
    status: 'HEALTHY',
    uptime: 99.99,
    successRate: 99.8,
    avgResponseTime: 245,
    errorCount: 0,
  },
  stats: {
    totalRequests: 125430,
    requestsToday: 1234,
    dataTransferred: '2.4 GB',
    lastError: null,
  },
  syncJobs: [
    { id: '1', type: 'LOADS_IMPORT', status: 'COMPLETED', startedAt: new Date(Date.now() - 3600000), recordsProcessed: 450 },
    { id: '2', type: 'RATES_UPDATE', status: 'COMPLETED', startedAt: new Date(Date.now() - 7200000), recordsProcessed: 1200 },
    { id: '3', type: 'LOADS_IMPORT', status: 'RUNNING', startedAt: new Date(Date.now() - 300000), recordsProcessed: 123 },
  ],
  recentActivity: [
    { type: 'API_CALL', action: 'GET /loads/search', status: 'success', timestamp: new Date(Date.now() - 60000) },
    { type: 'WEBHOOK', action: 'load.matched', status: 'success', timestamp: new Date(Date.now() - 120000) },
    { type: 'SYNC', action: 'Loads import completed', status: 'success', timestamp: new Date(Date.now() - 3600000) },
    { type: 'API_CALL', action: 'POST /loads/book', status: 'success', timestamp: new Date(Date.now() - 7200000) },
  ],
};

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'gray'; icon: React.ComponentType<{ className?: string }> }> = {
  ACTIVE: { color: 'green', icon: CheckCircleIcon },
  INACTIVE: { color: 'gray', icon: PauseIcon },
  ERROR: { color: 'red', icon: XCircleIcon },
};

const healthStatusConfig: Record<string, { color: 'green' | 'yellow' | 'red'; text: string }> = {
  HEALTHY: { color: 'green', text: 'All systems operational' },
  DEGRADED: { color: 'yellow', text: 'Experiencing intermittent issues' },
  ERROR: { color: 'red', text: 'Connection issues detected' },
};

const jobStatusColors: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
  COMPLETED: 'green',
  RUNNING: 'blue',
  FAILED: 'red',
  PENDING: 'gray',
};

export default function IntegrationDetailPage() {
  const params = useParams();
  const integrationId = params.id;
  const [syncing, setSyncing] = useState(false);

  const integration = mockIntegration;
  const statusCfg = statusConfig[integration.status]!;
  const StatusIcon = statusCfg.icon;
  const healthCfg = healthStatusConfig[integration.health.status]!;

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={integration.name}
        subtitle={integration.description}
      >
        <Link href="/integrations/my">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            My Integrations
          </Button>
        </Link>
        <Button variant="outline" onClick={handleSync} disabled={syncing}>
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
        <Button>
          <Cog6ToothIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </PageHeader>

      {/* Status & Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{integration.logo}</div>
            <div>
              <h3 className="text-xl font-semibold">{integration.name}</h3>
              <p className="text-sm text-gray-500">{integration.category}</p>
              <Badge variant={statusCfg.color} className="mt-1">
                <StatusIcon className="h-3 w-3 mr-1" />
                {integration.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Connected</span>
              <span>{integration.connectedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Sync</span>
              <span>{integration.lastSyncAt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sync Frequency</span>
              <span>{integration.syncFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auth Type</span>
              <span className="flex items-center gap-1">
                <KeyIcon className="h-4 w-4" />
                {integration.authType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Webhooks</span>
              <Badge variant={integration.webhooksEnabled ? 'green' : 'gray'}>
                {integration.webhooksEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t dark:border-gray-700 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <PauseIcon className="h-4 w-4 mr-1" />
              Disable
            </Button>
            <Button variant="danger" size="sm" className="flex-1">
              <TrashIcon className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </div>
        </Card>

        {/* Health Status */}
        <Card className={`p-6 border-l-4 ${
          integration.health.status === 'HEALTHY' ? 'border-l-green-500' :
          integration.health.status === 'DEGRADED' ? 'border-l-yellow-500' : 'border-l-red-500'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              integration.health.status === 'HEALTHY' ? 'bg-green-500' :
              integration.health.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <h3 className="text-lg font-semibold">Health Status</h3>
          </div>
          <p className={`text-sm mb-4 ${
            integration.health.status === 'HEALTHY' ? 'text-green-600' :
            integration.health.status === 'DEGRADED' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {healthCfg.text}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Uptime</p>
              <p className="text-xl font-bold text-green-600">{integration.health.uptime}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Success Rate</p>
              <p className="text-xl font-bold text-green-600">{integration.health.successRate}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Avg Response</p>
              <p className="text-xl font-bold">{integration.health.avgResponseTime}ms</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Errors (24h)</p>
              <p className={`text-xl font-bold ${integration.health.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {integration.health.errorCount}
              </p>
            </div>
          </div>

          <Link href="/integrations/health" className="block mt-4">
            <Button variant="ghost" className="w-full">
              View Full Health Report
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </Card>

        {/* Usage Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Usage Statistics</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Requests</p>
                <p className="text-xl font-bold">{integration.stats.totalRequests.toLocaleString()}</p>
              </div>
              <BoltIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Requests Today</p>
                <p className="text-xl font-bold">{integration.stats.requestsToday.toLocaleString()}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Data Transferred</p>
                <p className="text-xl font-bold">{integration.stats.dataTransferred}</p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <Link href="/integrations/logs" className="block mt-4">
            <Button variant="ghost" className="w-full">
              View API Logs
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Current Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Settings</h3>
          <Button variant="outline" size="sm">
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Auto Post Loads</p>
            <Badge variant={integration.settings.autoPost ? 'green' : 'gray'}>
              {integration.settings.autoPost ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Search Radius</p>
            <p className="font-medium">{integration.settings.loadRadius} miles</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Equipment Types</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {integration.settings.equipmentTypes.map(type => (
                <Badge key={type} variant="gray">{type.replace('_', ' ')}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Minimum Rating</p>
            <p className="font-medium">{integration.settings.minRating} ⭐</p>
          </div>
        </div>
      </Card>

      {/* Recent Sync Jobs & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sync Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Sync Jobs</h3>
            <Link href="/integrations/sync">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {integration.syncJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowPathIcon className={`h-5 w-5 ${job.status === 'RUNNING' ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">{job.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {job.recordsProcessed} records • {job.startedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={jobStatusColors[job.status]}>{job.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Link href="/integrations/logs">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {integration.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'API_CALL' && <BoltIcon className="h-5 w-5 text-purple-500" />}
                  {activity.type === 'WEBHOOK' && <ArrowTopRightOnSquareIcon className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'SYNC' && <ArrowPathIcon className="h-5 w-5 text-green-500" />}
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
