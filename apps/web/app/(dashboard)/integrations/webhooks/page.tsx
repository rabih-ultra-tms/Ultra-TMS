'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  BoltIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock webhook data
const mockEndpoints = [
  {
    id: 'wh1',
    endpointPath: '/webhooks/dat/loads',
    fullUrl: 'https://api.ultra-tms.com/v1/webhooks/dat/loads',
    eventTypes: ['load.created', 'load.updated', 'load.deleted'],
    handlerType: 'LOAD_SYNC',
    status: 'ACTIVE',
    isEnabled: true,
    totalReceived: 4523,
    totalProcessed: 4501,
    totalFailed: 22,
    lastReceivedAt: new Date(Date.now() - 300000),
  },
  {
    id: 'wh2',
    endpointPath: '/webhooks/quickbooks/invoices',
    fullUrl: 'https://api.ultra-tms.com/v1/webhooks/quickbooks/invoices',
    eventTypes: ['invoice.paid', 'invoice.overdue'],
    handlerType: 'INVOICE_UPDATE',
    status: 'ACTIVE',
    isEnabled: true,
    totalReceived: 892,
    totalProcessed: 892,
    totalFailed: 0,
    lastReceivedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'wh3',
    endpointPath: '/webhooks/samsara/tracking',
    fullUrl: 'https://api.ultra-tms.com/v1/webhooks/samsara/tracking',
    eventTypes: ['vehicle.location', 'vehicle.status'],
    handlerType: 'TRACKING_UPDATE',
    status: 'PAUSED',
    isEnabled: false,
    totalReceived: 12456,
    totalProcessed: 12400,
    totalFailed: 56,
    lastReceivedAt: new Date(Date.now() - 86400000),
  },
];

const mockSubscriptions = [
  {
    id: 'sub1',
    name: 'Load Status Notifier',
    url: 'https://partner.example.com/api/webhooks/loads',
    eventTypes: ['load.status_changed', 'load.delivered'],
    authType: 'HMAC',
    status: 'ACTIVE',
    isEnabled: true,
    totalSent: 1234,
    totalDelivered: 1230,
    totalFailed: 4,
    lastTriggeredAt: new Date(Date.now() - 600000),
    consecutiveFailures: 0,
  },
  {
    id: 'sub2',
    name: 'Accounting Sync',
    url: 'https://accounting.example.com/webhooks/tms',
    eventTypes: ['invoice.created', 'payment.received'],
    authType: 'API_KEY',
    status: 'ACTIVE',
    isEnabled: true,
    totalSent: 567,
    totalDelivered: 567,
    totalFailed: 0,
    lastTriggeredAt: new Date(Date.now() - 1800000),
    consecutiveFailures: 0,
  },
  {
    id: 'sub3',
    name: 'Customer Portal Updates',
    url: 'https://portal.example.com/api/notifications',
    eventTypes: ['shipment.tracking_update'],
    authType: 'OAUTH2',
    status: 'FAILED',
    isEnabled: true,
    totalSent: 89,
    totalDelivered: 67,
    totalFailed: 22,
    lastTriggeredAt: new Date(Date.now() - 300000),
    consecutiveFailures: 5,
    lastError: 'Connection timeout after 30 seconds',
  },
];

const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  ACTIVE: 'green',
  PAUSED: 'yellow',
  FAILED: 'red',
  DISABLED: 'gray',
};

export default function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'subscriptions'>('endpoints');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        subtitle="Manage inbound and outbound webhook configurations"
      >
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Integrations
          </Button>
        </Link>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'endpoints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inbound Endpoints ({mockEndpoints.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Outbound Subscriptions ({mockSubscriptions.length})
          </button>
        </div>
      </div>

      {/* Inbound Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <BoltIcon className="h-4 w-4 inline mr-2" />
              Inbound webhooks receive data from external services. Configure these endpoints to receive real-time updates.
            </p>
          </Card>

          {mockEndpoints.map(endpoint => (
            <Card key={endpoint.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {endpoint.endpointPath}
                    </code>
                    <Badge variant={statusColors[endpoint.status]}>{endpoint.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={endpoint.fullUrl}
                      readOnly
                      className="flex-1 text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded border-0"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyUrl(endpoint.id, endpoint.fullUrl)}
                    >
                      {copiedId === endpoint.id ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {endpoint.eventTypes.map(event => (
                      <span key={event} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Handler: {endpoint.handlerType}</span>
                    <span>Received: {endpoint.totalReceived.toLocaleString()}</span>
                    <span className="text-green-600">Processed: {endpoint.totalProcessed.toLocaleString()}</span>
                    {endpoint.totalFailed > 0 && (
                      <span className="text-red-600">Failed: {endpoint.totalFailed}</span>
                    )}
                    {endpoint.lastReceivedAt && (
                      <span>Last: {new Date(endpoint.lastReceivedAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" title="Rotate Secret">
                    <KeyIcon className="h-4 w-4" />
                  </Button>
                  {endpoint.isEnabled ? (
                    <Button variant="ghost" size="sm" title="Disable">
                      <PauseIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" title="Enable">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" title="Delete">
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Outbound Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              <BoltIcon className="h-4 w-4 inline mr-2" />
              Outbound webhooks send data to external services. Configure these to notify third-party systems of events.
            </p>
          </Card>

          {mockSubscriptions.map(subscription => (
            <Card key={subscription.id} className={`p-6 ${subscription.status === 'FAILED' ? 'border-red-300 dark:border-red-800' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{subscription.name}</span>
                    <Badge variant={statusColors[subscription.status]}>{subscription.status}</Badge>
                    <Badge variant="gray">{subscription.authType}</Badge>
                  </div>

                  {subscription.status === 'FAILED' && subscription.lastError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <XCircleIcon className="h-4 w-4 inline mr-1" />
                        {subscription.lastError} ({subscription.consecutiveFailures} consecutive failures)
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-2">{subscription.url}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {subscription.eventTypes.map(event => (
                      <span key={event} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Sent: {subscription.totalSent.toLocaleString()}</span>
                    <span className="text-green-600">Delivered: {subscription.totalDelivered.toLocaleString()}</span>
                    {subscription.totalFailed > 0 && (
                      <span className="text-red-600">Failed: {subscription.totalFailed}</span>
                    )}
                    {subscription.lastTriggeredAt && (
                      <span>Last: {new Date(subscription.lastTriggeredAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/integrations/webhooks/${subscription.id}/deliveries`}>
                    <Button variant="ghost" size="sm" title="View Deliveries">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" title="Test">
                    <ArrowPathIcon className="h-4 w-4" />
                  </Button>
                  {subscription.isEnabled ? (
                    <Button variant="ghost" size="sm" title="Disable">
                      <PauseIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" title="Enable">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" title="Delete">
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
