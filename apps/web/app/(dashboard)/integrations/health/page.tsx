'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SignalIcon,
  ClockIcon,
  ServerIcon,
  ChartBarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock health data
const mockIntegrations = [
  {
    id: '1',
    name: 'DAT Load Board',
    logo: '🚚',
    status: 'HEALTHY',
    lastSuccessfulCall: new Date(Date.now() - 60000),
    errorCount: 0,
    circuitBreakerState: 'CLOSED',
    rateLimitUsage: 45,
    rateLimitMax: 100,
    avgResponseTime: 245,
    uptime: 99.99,
    requestsLast24h: 4523,
    successRate: 99.8,
  },
  {
    id: '2',
    name: 'QuickBooks Online',
    logo: '💰',
    status: 'HEALTHY',
    lastSuccessfulCall: new Date(Date.now() - 3600000),
    errorCount: 0,
    circuitBreakerState: 'CLOSED',
    rateLimitUsage: 12,
    rateLimitMax: 50,
    avgResponseTime: 890,
    uptime: 100,
    requestsLast24h: 156,
    successRate: 100,
  },
  {
    id: '3',
    name: 'HubSpot CRM',
    logo: '🎯',
    status: 'ERROR',
    lastSuccessfulCall: new Date(Date.now() - 86400000),
    lastError: 'OAuth token expired. Please re-authenticate.',
    errorCount: 23,
    circuitBreakerState: 'OPEN',
    rateLimitUsage: 0,
    rateLimitMax: 100,
    avgResponseTime: 0,
    uptime: 72.5,
    requestsLast24h: 0,
    successRate: 0,
  },
  {
    id: '4',
    name: 'Samsara ELD',
    logo: '📍',
    status: 'DEGRADED',
    lastSuccessfulCall: new Date(Date.now() - 300000),
    lastError: 'Intermittent timeout errors',
    errorCount: 5,
    circuitBreakerState: 'HALF_OPEN',
    rateLimitUsage: 78,
    rateLimitMax: 100,
    avgResponseTime: 2340,
    uptime: 95.2,
    requestsLast24h: 8901,
    successRate: 94.5,
  },
];

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red'; icon: React.ComponentType<{ className?: string }> }> = {
  HEALTHY: { color: 'green', icon: CheckCircleIcon },
  DEGRADED: { color: 'yellow', icon: ExclamationTriangleIcon },
  ERROR: { color: 'red', icon: XCircleIcon },
};

const circuitBreakerColors: Record<string, string> = {
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  HALF_OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  OPEN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function IntegrationHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const overallStats = {
    total: mockIntegrations.length,
    healthy: mockIntegrations.filter(i => i.status === 'HEALTHY').length,
    degraded: mockIntegrations.filter(i => i.status === 'DEGRADED').length,
    error: mockIntegrations.filter(i => i.status === 'ERROR').length,
    avgUptime: (mockIntegrations.reduce((sum, i) => sum + i.uptime, 0) / mockIntegrations.length).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integration Health"
        subtitle="Monitor the health and status of all connected integrations"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Integrations
          </Button>
        </Link>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Overall Status */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold">{overallStats.total}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Healthy</p>
          <p className="text-3xl font-bold text-green-600">{overallStats.healthy}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-500">Degraded</p>
          <p className="text-3xl font-bold text-yellow-600">{overallStats.degraded}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Error</p>
          <p className="text-3xl font-bold text-red-600">{overallStats.error}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Avg Uptime</p>
          <p className="text-3xl font-bold">{overallStats.avgUptime}%</p>
        </Card>
      </div>

      {/* Integrations Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockIntegrations.map(integration => {
          const config = statusConfig[integration.status]!;
          const StatusIcon = config.icon;
          const rateLimitPercent = (integration.rateLimitUsage / integration.rateLimitMax) * 100;
          
          return (
            <Card key={integration.id} className={`p-6 ${
              integration.status === 'ERROR' ? 'border-red-300 dark:border-red-800' : 
              integration.status === 'DEGRADED' ? 'border-yellow-300 dark:border-yellow-800' : ''
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.logo}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {integration.status}
                      </Badge>
                      <span className={`text-xs px-2 py-0.5 rounded ${circuitBreakerColors[integration.circuitBreakerState]}`}>
                        CB: {integration.circuitBreakerState}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/integrations/${integration.id}`}>
                  <Button variant="ghost" size="sm">View Details</Button>
                </Link>
              </div>

              {/* Error Message */}
              {integration.lastError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                    {integration.lastError}
                  </p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <SignalIcon className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className={`text-lg font-semibold ${
                    integration.uptime >= 99 ? 'text-green-600' :
                    integration.uptime >= 95 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {integration.uptime}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-gray-500">Success Rate</p>
                  <p className={`text-lg font-semibold ${
                    integration.successRate >= 99 ? 'text-green-600' :
                    integration.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {integration.successRate}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <ClockIcon className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-gray-500">Avg Response</p>
                  <p className={`text-lg font-semibold ${
                    integration.avgResponseTime === 0 ? 'text-gray-400' :
                    integration.avgResponseTime < 500 ? 'text-green-600' :
                    integration.avgResponseTime < 2000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {integration.avgResponseTime || '-'}ms
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <BoltIcon className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-gray-500">24h Requests</p>
                  <p className="text-lg font-semibold">
                    {integration.requestsLast24h.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Rate Limit Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Rate Limit Usage</span>
                  <span className={rateLimitPercent > 80 ? 'text-red-600' : rateLimitPercent > 50 ? 'text-yellow-600' : ''}>
                    {integration.rateLimitUsage}/{integration.rateLimitMax} requests
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      rateLimitPercent > 80 ? 'bg-red-500' :
                      rateLimitPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${rateLimitPercent}%` }}
                  />
                </div>
              </div>

              {/* Last Success */}
              <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
                <span>Last successful call:</span>
                <span>
                  {integration.lastSuccessfulCall 
                    ? new Date(integration.lastSuccessfulCall).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
