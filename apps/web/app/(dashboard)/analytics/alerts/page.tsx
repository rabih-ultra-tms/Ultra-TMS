'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

const mockAlerts = [
  { 
    id: '1', 
    kpiId: '8',
    kpiName: 'On-Time Delivery %', 
    kpiCode: 'ON_TIME_DELIVERY',
    alertType: 'CRITICAL', 
    currentValue: 94.2,
    thresholdValue: 95,
    message: 'On-Time Delivery dropped below 95% threshold',
    isAcknowledged: false,
    createdAt: '2024-01-15 10:30 AM',
  },
  { 
    id: '2', 
    kpiId: '3',
    kpiName: 'Gross Margin %', 
    kpiCode: 'GROSS_MARGIN',
    alertType: 'WARNING', 
    currentValue: 18.5,
    thresholdValue: 19,
    message: 'Gross Margin approaching warning threshold',
    isAcknowledged: false,
    createdAt: '2024-01-15 09:45 AM',
  },
  { 
    id: '3', 
    kpiId: '11',
    kpiName: 'Tender Accept Rate', 
    kpiCode: 'CARRIER_TENDER_ACCEPT',
    alertType: 'WARNING', 
    currentValue: 85.5,
    thresholdValue: 88,
    message: 'Tender acceptance rate below target',
    isAcknowledged: false,
    createdAt: '2024-01-15 08:15 AM',
  },
  { 
    id: '4', 
    kpiId: '16',
    kpiName: 'New Customers MTD', 
    kpiCode: 'NEW_CUSTOMERS_MTD',
    alertType: 'WARNING', 
    currentValue: 12,
    thresholdValue: 15,
    message: 'New customer acquisition behind target',
    isAcknowledged: true,
    acknowledgedBy: 'John Smith',
    acknowledgedAt: '2024-01-15 07:00 AM',
    createdAt: '2024-01-14 05:00 PM',
  },
  { 
    id: '5', 
    kpiId: '4',
    kpiName: 'Net Margin %', 
    kpiCode: 'NET_MARGIN',
    alertType: 'WARNING', 
    currentValue: 8.2,
    thresholdValue: 9,
    message: 'Net margin below warning threshold',
    isAcknowledged: true,
    acknowledgedBy: 'Jane Doe',
    acknowledgedAt: '2024-01-14 03:30 PM',
    createdAt: '2024-01-14 02:00 PM',
  },
  { 
    id: '6', 
    kpiId: '15',
    kpiName: 'Quote Conversion %', 
    kpiCode: 'QUOTE_CONVERSION',
    alertType: 'CRITICAL', 
    currentValue: 26.0,
    thresholdValue: 28,
    message: 'Quote conversion rate critically low',
    isAcknowledged: true,
    acknowledgedBy: 'Sales Team',
    acknowledgedAt: '2024-01-13 11:00 AM',
    resolutionNotes: 'Implementing new follow-up process',
    createdAt: '2024-01-13 09:00 AM',
  },
];

function getAlertIcon(type: string, acknowledged: boolean) {
  if (acknowledged) {
    return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  }
  if (type === 'CRITICAL') {
    return <XCircleIcon className="h-5 w-5 text-red-500" />;
  }
  return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
}

function getAlertBadgeVariant(type: string, acknowledged: boolean): 'success' | 'warning' | 'error' | 'default' {
  if (acknowledged) return 'default';
  if (type === 'CRITICAL') return 'error';
  return 'warning';
}

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ACTIVE');

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (filterType === 'ACTIVE' && alert.isAcknowledged) return false;
    if (filterType === 'ACKNOWLEDGED' && !alert.isAcknowledged) return false;
    if (searchQuery && !alert.kpiName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeCount = mockAlerts.filter((a) => !a.isAcknowledged).length;
  const criticalCount = mockAlerts.filter((a) => !a.isAcknowledged && a.alertType === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Alerts"
        description="Monitor and respond to KPI threshold breaches"
        actions={
          <Button variant="outline" size="sm">
            <FunnelIcon className="h-4 w-4 mr-1" />
            Alert Settings
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <BellAlertIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Active Alerts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {mockAlerts.filter((a) => a.isAcknowledged).length}
              </p>
              <p className="text-sm text-gray-500">Acknowledged Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('ALL')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'ACTIVE' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('ACTIVE')}
          >
            Active
          </Button>
          <Button
            variant={filterType === 'ACKNOWLEDGED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('ACKNOWLEDGED')}
          >
            Acknowledged
          </Button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`p-4 ${!alert.isAcknowledged && alert.alertType === 'CRITICAL' ? 'border-l-4 border-l-red-500' : !alert.isAcknowledged ? 'border-l-4 border-l-yellow-500' : ''}`}>
            <div className="flex items-start gap-4">
              {getAlertIcon(alert.alertType, alert.isAcknowledged)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-900">{alert.kpiName}</h3>
                  <Badge variant={getAlertBadgeVariant(alert.alertType, alert.isAcknowledged)}>
                    {alert.isAcknowledged ? 'ACKNOWLEDGED' : alert.alertType}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Current: <strong>{alert.currentValue}</strong></span>
                  <span>Threshold: <strong>{alert.thresholdValue}</strong></span>
                  <span>Created: {alert.createdAt}</span>
                  {alert.isAcknowledged && (
                    <>
                      <span>Acknowledged by: {alert.acknowledgedBy}</span>
                      <span>At: {alert.acknowledgedAt}</span>
                    </>
                  )}
                </div>
                {alert.resolutionNotes && (
                  <p className="text-sm text-slate-500 mt-2 italic">
                    Resolution: {alert.resolutionNotes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!alert.isAcknowledged && (
                  <>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                    <Button variant="primary" size="sm">
                      Resolve
                    </Button>
                  </>
                )}
                <Link href={`/analytics/kpis/${alert.kpiId}`}>
                  <Button variant="ghost" size="sm">
                    View KPI
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No alerts found</h3>
            <p className="text-sm text-gray-500">
              {filterType === 'ACTIVE' 
                ? 'All alerts have been acknowledged. Great job!' 
                : 'No alerts match your search criteria.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
