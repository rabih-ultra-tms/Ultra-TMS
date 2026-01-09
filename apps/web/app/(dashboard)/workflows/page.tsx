'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CubeTransparentIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock workflow data
const mockWorkflows = [
  {
    id: '1',
    name: 'New Load Approval',
    description: 'Automatic approval workflow for new load orders based on value thresholds',
    category: 'LOAD_PROCESSING',
    triggerType: 'EVENT',
    triggerConfig: { event: 'load.created' },
    status: 'ACTIVE',
    version: 3,
    stepsCount: 5,
    executionsCount: 1247,
    successRate: 94.5,
    avgDuration: '2.5 min',
    lastExecutedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 86400000 * 30),
  },
  {
    id: '2',
    name: 'Carrier Onboarding',
    description: 'Multi-step approval process for new carrier registration',
    category: 'CARRIER_MANAGEMENT',
    triggerType: 'MANUAL',
    triggerConfig: {},
    status: 'ACTIVE',
    version: 2,
    stepsCount: 8,
    executionsCount: 89,
    successRate: 87.6,
    avgDuration: '24 hrs',
    lastExecutedAt: new Date(Date.now() - 7200000),
    createdAt: new Date(Date.now() - 86400000 * 60),
  },
  {
    id: '3',
    name: 'Invoice Processing',
    description: 'Automated invoice generation and approval workflow',
    category: 'ACCOUNTING',
    triggerType: 'SCHEDULED',
    triggerConfig: { cron: '0 8 * * *' },
    status: 'ACTIVE',
    version: 1,
    stepsCount: 6,
    executionsCount: 432,
    successRate: 98.1,
    avgDuration: '5 min',
    lastExecutedAt: new Date(Date.now() - 3600000 * 16),
    createdAt: new Date(Date.now() - 86400000 * 15),
  },
  {
    id: '4',
    name: 'Document Verification',
    description: 'Verify and process uploaded driver documents',
    category: 'DOCUMENT_WORKFLOW',
    triggerType: 'EVENT',
    triggerConfig: { event: 'document.uploaded' },
    status: 'PAUSED',
    version: 4,
    stepsCount: 4,
    executionsCount: 2156,
    successRate: 91.2,
    avgDuration: '1 min',
    lastExecutedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000 * 90),
  },
  {
    id: '5',
    name: 'Credit Check Automation',
    description: 'Automated credit check workflow for new customers',
    category: 'CUSTOMER',
    triggerType: 'API',
    triggerConfig: { endpoint: '/api/workflows/credit-check' },
    status: 'DRAFT',
    version: 1,
    stepsCount: 3,
    executionsCount: 0,
    successRate: 0,
    avgDuration: '-',
    lastExecutedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
];

const categoryColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'> = {
  LOAD_PROCESSING: 'blue',
  CARRIER_MANAGEMENT: 'green',
  ACCOUNTING: 'yellow',
  DOCUMENT_WORKFLOW: 'purple',
  CUSTOMER: 'red',
};

const statusColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  ACTIVE: 'green',
  PAUSED: 'yellow',
  DRAFT: 'gray',
  ARCHIVED: 'red',
};

const triggerIcons: Record<string, string> = {
  EVENT: '⚡',
  MANUAL: '👤',
  SCHEDULED: '📅',
  API: '🔗',
};

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || workflow.category === selectedCategory;
    const matchesStatus = !selectedStatus || workflow.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(mockWorkflows.map(w => w.category))];
  const statuses = ['ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED'];

  const stats = {
    total: mockWorkflows.length,
    active: mockWorkflows.filter(w => w.status === 'ACTIVE').length,
    totalExecutions: mockWorkflows.reduce((sum, w) => sum + w.executionsCount, 0),
    avgSuccessRate: mockWorkflows.filter(w => w.successRate > 0).reduce((sum, w) => sum + w.successRate, 0) / 
      mockWorkflows.filter(w => w.successRate > 0).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        subtitle="Design and manage automated business processes"
      >
        <Link href="/workflows/templates">
          <Button variant="outline">
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </Link>
        <Link href="/workflows/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CubeTransparentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <PlayIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Executions</p>
              <p className="text-2xl font-semibold">{stats.totalExecutions.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Success Rate</p>
              <p className="text-2xl font-semibold">{stats.avgSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map(workflow => (
          <Card key={workflow.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-2xl">
                  {triggerIcons[workflow.triggerType]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/workflows/${workflow.id}`} className="text-lg font-medium hover:text-blue-600">
                      {workflow.name}
                    </Link>
                    <Badge variant={statusColors[workflow.status]}>{workflow.status}</Badge>
                    <Badge variant={categoryColors[workflow.category] || 'gray'}>
                      {workflow.category.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">v{workflow.version}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {workflow.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CubeTransparentIcon className="h-4 w-4" />
                      {workflow.stepsCount} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <ChartBarIcon className="h-4 w-4" />
                      {workflow.executionsCount.toLocaleString()} executions
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4" />
                      {workflow.successRate > 0 ? `${workflow.successRate}% success` : 'No data'}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Avg: {workflow.avgDuration}
                    </span>
                    {workflow.lastExecutedAt && (
                      <span className="flex items-center gap-1">
                        Last run: {new Date(workflow.lastExecutedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {workflow.status === 'ACTIVE' ? (
                  <Button variant="ghost" size="sm" title="Pause Workflow">
                    <PauseIcon className="h-4 w-4" />
                  </Button>
                ) : workflow.status !== 'DRAFT' ? (
                  <Button variant="ghost" size="sm" title="Activate Workflow">
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                ) : null}
                <Link href={`/workflows/${workflow.id}/executions`}>
                  <Button variant="ghost" size="sm" title="View Executions">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/workflows/${workflow.id}/edit`}>
                  <Button variant="ghost" size="sm" title="Edit Workflow">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" title="Clone Workflow">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete Workflow">
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card className="p-12 text-center">
          <CubeTransparentIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory || selectedStatus
              ? 'Try adjusting your search filters'
              : 'Get started by creating your first workflow'}
          </p>
          <Link href="/workflows/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
