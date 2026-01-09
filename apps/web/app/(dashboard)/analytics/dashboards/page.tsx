'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  StarIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

const mockDashboards = [
  { 
    id: '1', 
    name: 'Executive Overview', 
    slug: 'executive-overview',
    description: 'High-level view of company performance',
    ownerType: 'SYSTEM',
    widgetCount: 12,
    isPublic: true,
    isDefault: true,
    lastViewed: '2024-01-15 10:30 AM',
    createdBy: 'System',
  },
  { 
    id: '2', 
    name: 'Operations Dashboard', 
    slug: 'operations',
    description: 'Real-time operational metrics',
    ownerType: 'SYSTEM',
    widgetCount: 15,
    isPublic: true,
    isDefault: false,
    lastViewed: '2024-01-15 09:15 AM',
    createdBy: 'System',
  },
  { 
    id: '3', 
    name: 'Sales Performance', 
    slug: 'sales-performance',
    description: 'Sales team KPIs and pipeline',
    ownerType: 'ROLE',
    widgetCount: 10,
    isPublic: false,
    isDefault: false,
    lastViewed: '2024-01-14 04:45 PM',
    createdBy: 'Sales Manager',
  },
  { 
    id: '4', 
    name: 'Carrier Metrics', 
    slug: 'carrier-metrics',
    description: 'Carrier performance and compliance',
    ownerType: 'SYSTEM',
    widgetCount: 8,
    isPublic: true,
    isDefault: false,
    lastViewed: '2024-01-14 02:30 PM',
    createdBy: 'System',
  },
  { 
    id: '5', 
    name: 'My Custom Dashboard', 
    slug: 'my-custom',
    description: 'Personal metrics view',
    ownerType: 'USER',
    widgetCount: 6,
    isPublic: false,
    isDefault: false,
    lastViewed: '2024-01-13 11:00 AM',
    createdBy: 'John Smith',
  },
  { 
    id: '6', 
    name: 'Financial Overview', 
    slug: 'financial-overview',
    description: 'Revenue, margins, and profitability',
    ownerType: 'SYSTEM',
    widgetCount: 9,
    isPublic: true,
    isDefault: false,
    lastViewed: '2024-01-15 08:00 AM',
    createdBy: 'System',
  },
];

function getOwnerIcon(ownerType: string) {
  switch (ownerType) {
    case 'SYSTEM': return <BuildingOfficeIcon className="h-4 w-4" />;
    case 'ROLE': return <UserGroupIcon className="h-4 w-4" />;
    case 'USER': return <UserIcon className="h-4 w-4" />;
    default: return <TableCellsIcon className="h-4 w-4" />;
  }
}

function getOwnerLabel(ownerType: string) {
  switch (ownerType) {
    case 'SYSTEM': return 'System';
    case 'ROLE': return 'Role';
    case 'USER': return 'Personal';
    default: return ownerType;
  }
}

export default function DashboardsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredDashboards = mockDashboards.filter((dashboard) => {
    if (filterType !== 'ALL' && dashboard.ownerType !== filterType) return false;
    if (searchQuery && !dashboard.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboards"
        description="View and manage your analytics dashboards"
        actions={
          <Link href="/analytics/dashboards/builder">
            <Button variant="primary" size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Dashboard
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'SYSTEM', 'ROLE', 'USER'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'All' : getOwnerLabel(type)}
            </Button>
          ))}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDashboards.map((dashboard) => (
          <Card key={dashboard.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TableCellsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{dashboard.name}</h3>
                    {dashboard.isDefault && (
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{dashboard.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {getOwnerIcon(dashboard.ownerType)}
                <span>{getOwnerLabel(dashboard.ownerType)}</span>
              </div>
              <span>•</span>
              <span>{dashboard.widgetCount} widgets</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dashboard.isPublic && <Badge variant="success" size="sm">Public</Badge>}
                {!dashboard.isPublic && <Badge variant="default" size="sm">Private</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/analytics/dashboards/${dashboard.id}`}>
                  <Button variant="ghost" size="sm">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/analytics/dashboards/builder?id=${dashboard.id}`}>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ShareIcon className="h-4 w-4" />
                </Button>
                {dashboard.ownerType === 'USER' && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-gray-400">Last viewed: {dashboard.lastViewed}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
