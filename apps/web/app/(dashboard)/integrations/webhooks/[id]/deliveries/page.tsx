'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock webhook deliveries
const mockWebhook = {
  id: '1',
  name: 'Load Status Updates',
  url: 'https://api.example.com/webhooks/tms',
  events: ['load.created', 'load.updated', 'load.delivered'],
  status: 'ACTIVE',
};

const mockDeliveries = [
  {
    id: 'd1',
    event: 'load.created',
    payload: { loadId: 'L-1234', status: 'CREATED', origin: 'Los Angeles, CA', destination: 'Chicago, IL' },
    status: 'DELIVERED',
    statusCode: 200,
    attempts: 1,
    createdAt: new Date(Date.now() - 60000),
    deliveredAt: new Date(Date.now() - 59000),
    responseTime: 234,
    responseBody: '{"received":true}',
  },
  {
    id: 'd2',
    event: 'load.updated',
    payload: { loadId: 'L-1233', status: 'IN_TRANSIT', currentLocation: 'Denver, CO' },
    status: 'DELIVERED',
    statusCode: 200,
    attempts: 1,
    createdAt: new Date(Date.now() - 3600000),
    deliveredAt: new Date(Date.now() - 3599000),
    responseTime: 189,
    responseBody: '{"received":true}',
  },
  {
    id: 'd3',
    event: 'load.delivered',
    payload: { loadId: 'L-1232', status: 'DELIVERED', deliveredAt: '2024-02-14T15:30:00Z' },
    status: 'FAILED',
    statusCode: 500,
    attempts: 3,
    createdAt: new Date(Date.now() - 7200000),
    lastAttemptAt: new Date(Date.now() - 3600000),
    responseTime: 5000,
    responseBody: '{"error":"Internal server error"}',
    errorMessage: 'Maximum retry attempts reached',
  },
  {
    id: 'd4',
    event: 'load.updated',
    payload: { loadId: 'L-1231', status: 'PICKED_UP', pickupTime: '2024-02-14T08:00:00Z' },
    status: 'DELIVERED',
    statusCode: 201,
    attempts: 2,
    createdAt: new Date(Date.now() - 86400000),
    deliveredAt: new Date(Date.now() - 86300000),
    responseTime: 456,
    responseBody: '{"received":true,"id":"evt_123"}',
  },
  {
    id: 'd5',
    event: 'load.created',
    payload: { loadId: 'L-1230', status: 'CREATED', origin: 'Dallas, TX', destination: 'Miami, FL' },
    status: 'PENDING',
    statusCode: null,
    attempts: 0,
    createdAt: new Date(Date.now() - 5000),
    responseTime: null,
    responseBody: null,
  },
  {
    id: 'd6',
    event: 'load.updated',
    payload: { loadId: 'L-1229', status: 'CANCELLED' },
    status: 'DELIVERED',
    statusCode: 200,
    attempts: 1,
    createdAt: new Date(Date.now() - 172800000),
    deliveredAt: new Date(Date.now() - 172799000),
    responseTime: 312,
    responseBody: '{"received":true}',
  },
];

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'; icon: React.ComponentType<{ className?: string }> }> = {
  DELIVERED: { color: 'green', icon: CheckCircleIcon },
  FAILED: { color: 'red', icon: XCircleIcon },
  PENDING: { color: 'blue', icon: ClockIcon },
  RETRYING: { color: 'yellow', icon: ArrowPathIcon },
};

export default function WebhookDeliveriesPage() {
  const params = useParams();
  const webhookId = params.id;
  const [filter, setFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [replaying, setReplaying] = useState<string | null>(null);

  const filteredDeliveries = mockDeliveries.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (eventFilter !== 'all' && d.event !== eventFilter) return false;
    return true;
  });

  const stats = {
    total: mockDeliveries.length,
    delivered: mockDeliveries.filter(d => d.status === 'DELIVERED').length,
    failed: mockDeliveries.filter(d => d.status === 'FAILED').length,
    pending: mockDeliveries.filter(d => d.status === 'PENDING').length,
    avgResponseTime: Math.round(
      mockDeliveries.filter(d => d.responseTime).reduce((sum, d) => sum + (d.responseTime || 0), 0) /
      mockDeliveries.filter(d => d.responseTime).length
    ),
  };

  const events = [...new Set(mockDeliveries.map(d => d.event))];

  const handleReplay = async (deliveryId: string) => {
    setReplaying(deliveryId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setReplaying(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhook Deliveries"
        subtitle={`Delivery history for "${mockWebhook.name}"`}
      >
        <Link href="/integrations/webhooks">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Webhooks
          </Button>
        </Link>
        <Button variant="outline">
          <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
          View Webhook Settings
        </Button>
      </PageHeader>

      {/* Webhook Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{mockWebhook.name}</h3>
              <Badge variant="green">{mockWebhook.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{mockWebhook.url}</p>
          </div>
          <div className="flex items-center gap-2">
            {mockWebhook.events.map(event => (
              <Badge key={event} variant="gray">{event}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Avg Response</p>
          <p className="text-3xl font-bold">{stats.avgResponseTime}ms</p>
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
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Deliveries List */}
      <div className="space-y-3">
        {filteredDeliveries.length === 0 ? (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
            <p className="text-gray-500">No deliveries match your current filters.</p>
          </Card>
        ) : (
          filteredDeliveries.map(delivery => {
            const config = statusConfig[delivery.status]!;
            const StatusIcon = config.icon;
            const isExpanded = expandedDelivery === delivery.id;
            
            return (
              <Card key={delivery.id} className={`overflow-hidden ${
                delivery.status === 'FAILED' ? 'border-red-300 dark:border-red-800' : ''
              }`}>
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`h-5 w-5 ${
                        delivery.status === 'DELIVERED' ? 'text-green-500' :
                        delivery.status === 'FAILED' ? 'text-red-500' :
                        delivery.status === 'PENDING' ? 'text-blue-500' : 'text-yellow-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="gray">{delivery.event}</Badge>
                          <Badge variant={config.color}>{delivery.status}</Badge>
                          {delivery.statusCode && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              delivery.statusCode < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              delivery.statusCode < 400 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              HTTP {delivery.statusCode}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {delivery.createdAt.toLocaleString()}
                          {delivery.attempts > 1 && ` • ${delivery.attempts} attempts`}
                          {delivery.responseTime && ` • ${delivery.responseTime}ms`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {delivery.status === 'FAILED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplay(delivery.id);
                          }}
                          disabled={replaying === delivery.id}
                        >
                          <ArrowPathIcon className={`h-4 w-4 mr-1 ${replaying === delivery.id ? 'animate-spin' : ''}`} />
                          Replay
                        </Button>
                      )}
                      <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                    {/* Error Message */}
                    {delivery.errorMessage && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <ExclamationTriangleIcon className="h-5 w-5" />
                          <span className="font-medium">{delivery.errorMessage}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payload */}
                      <div>
                        <p className="text-sm font-medium mb-2">Request Payload</p>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(delivery.payload, null, 2)}
                        </pre>
                      </div>

                      {/* Response */}
                      <div>
                        <p className="text-sm font-medium mb-2">Response</p>
                        {delivery.responseBody ? (
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(JSON.parse(delivery.responseBody), null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-500">No response yet</p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Delivery ID:</span>
                        <p className="font-mono">{delivery.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p>{delivery.createdAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivered:</span>
                        <p>{delivery.deliveredAt?.toLocaleString() || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Response Time:</span>
                        <p>{delivery.responseTime ? `${delivery.responseTime}ms` : '-'}</p>
                      </div>
                    </div>
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
