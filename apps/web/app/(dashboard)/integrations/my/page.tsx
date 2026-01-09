'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PuzzlePieceIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock connected integrations
const mockIntegrations = [
  {
    id: '1',
    name: 'DAT Load Board - Production',
    providerCode: 'DAT',
    providerName: 'DAT Load Board',
    logo: '🚚',
    status: 'ACTIVE',
    environment: 'PRODUCTION',
    lastSuccessfulCall: new Date(Date.now() - 300000),
    lastError: null,
    errorCount: 0,
    syncFrequency: 'REALTIME',
    isEnabled: true,
    stats: {
      requestsToday: 1247,
      successRate: 99.8,
      avgResponseTime: 245,
    },
  },
  {
    id: '2',
    name: 'QuickBooks Sync',
    providerCode: 'QUICKBOOKS',
    providerName: 'QuickBooks Online',
    logo: '💰',
    status: 'ACTIVE',
    environment: 'PRODUCTION',
    lastSuccessfulCall: new Date(Date.now() - 3600000),
    lastError: null,
    errorCount: 0,
    syncFrequency: 'HOURLY',
    isEnabled: true,
    stats: {
      requestsToday: 156,
      successRate: 100,
      avgResponseTime: 890,
    },
  },
  {
    id: '3',
    name: 'HubSpot CRM',
    providerCode: 'HUBSPOT',
    providerName: 'HubSpot CRM',
    logo: '🎯',
    status: 'ERROR',
    environment: 'PRODUCTION',
    lastSuccessfulCall: new Date(Date.now() - 86400000),
    lastError: 'OAuth token expired. Please re-authenticate.',
    errorCount: 23,
    syncFrequency: 'HOURLY',
    isEnabled: true,
    stats: {
      requestsToday: 0,
      successRate: 0,
      avgResponseTime: 0,
    },
  },
  {
    id: '4',
    name: 'DAT Sandbox',
    providerCode: 'DAT',
    providerName: 'DAT Load Board',
    logo: '🚚',
    status: 'PAUSED',
    environment: 'SANDBOX',
    lastSuccessfulCall: new Date(Date.now() - 604800000),
    lastError: null,
    errorCount: 0,
    syncFrequency: 'MANUAL',
    isEnabled: false,
    stats: {
      requestsToday: 0,
      successRate: 98.5,
      avgResponseTime: 320,
    },
  },
];

const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  ACTIVE: 'green',
  ERROR: 'red',
  PAUSED: 'yellow',
  PENDING_AUTH: 'yellow',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ACTIVE: CheckCircleIcon,
  ERROR: XCircleIcon,
  PAUSED: PauseIcon,
  PENDING_AUTH: ExclamationTriangleIcon,
};

export default function MyIntegrationsPage() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');

  const filteredIntegrations = mockIntegrations.filter(integration => {
    return !selectedEnvironment || integration.environment === selectedEnvironment;
  });

  const stats = {
    total: mockIntegrations.length,
    active: mockIntegrations.filter(i => i.status === 'ACTIVE').length,
    errors: mockIntegrations.filter(i => i.status === 'ERROR').length,
    totalRequests: mockIntegrations.reduce((sum, i) => sum + i.stats.requestsToday, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Integrations"
        subtitle="Manage your connected integrations and their settings"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <PuzzlePieceIcon className="h-4 w-4 mr-2" />
            Browse Marketplace
          </Button>
        </Link>
        <Link href="/integrations/connect">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PuzzlePieceIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Errors</p>
              <p className="text-2xl font-semibold">{stats.errors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Requests Today</p>
              <p className="text-2xl font-semibold">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Environments</option>
            <option value="PRODUCTION">Production</option>
            <option value="SANDBOX">Sandbox</option>
            <option value="TEST">Test</option>
          </select>
        </div>
      </Card>

      {/* Integrations List */}
      <div className="space-y-4">
        {filteredIntegrations.map(integration => {
          const StatusIcon = statusIcons[integration.status] || CheckCircleIcon;
          
          return (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{integration.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/integrations/${integration.id}`}
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {integration.name}
                      </Link>
                      <Badge variant={statusColors[integration.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {integration.status}
                      </Badge>
                      <Badge variant="gray">{integration.environment}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {integration.providerName}
                    </p>

                    {integration.lastError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                          {integration.lastError}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ArrowPathIcon className="h-4 w-4" />
                        Sync: {integration.syncFrequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4" />
                        {integration.stats.requestsToday.toLocaleString()} requests today
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        {integration.stats.successRate}% success
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {integration.stats.avgResponseTime}ms avg
                      </span>
                      {integration.lastSuccessfulCall && (
                        <span>
                          Last success: {new Date(integration.lastSuccessfulCall).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {integration.status === 'ERROR' && (
                    <Button variant="outline" size="sm">
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                  {integration.isEnabled ? (
                    <Button variant="ghost" size="sm" title="Disable">
                      <PauseIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" title="Enable">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Link href={`/integrations/${integration.id}/settings`}>
                    <Button variant="ghost" size="sm" title="Settings">
                      <Cog6ToothIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" title="Delete">
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card className="p-12 text-center">
          <PuzzlePieceIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-gray-500 mb-4">
            Connect your first integration to get started
          </p>
          <Link href="/integrations">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Browse Integrations
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
