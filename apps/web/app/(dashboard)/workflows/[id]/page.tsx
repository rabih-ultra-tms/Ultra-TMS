'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock workflow detail
const mockWorkflow = {
  id: '1',
  name: 'New Load Approval',
  description: 'Automatic approval workflow for new load orders based on value thresholds. This workflow routes high-value loads to managers for approval while auto-approving standard loads.',
  category: 'LOAD_PROCESSING',
  triggerType: 'EVENT',
  triggerConfig: { event: 'load.created', filters: { status: 'PENDING' } },
  status: 'ACTIVE',
  version: 3,
  isPublished: true,
  createdAt: new Date(Date.now() - 86400000 * 30),
  updatedAt: new Date(Date.now() - 86400000 * 2),
  createdBy: 'John Smith',
  steps: [
    { id: 's1', name: 'Check Load Value', type: 'CONDITION', order: 1, description: 'Evaluate load value against thresholds' },
    { id: 's2', name: 'Auto-Approve Standard', type: 'ACTION', order: 2, description: 'Automatically approve loads under $10,000' },
    { id: 's3', name: 'Request Manager Approval', type: 'APPROVAL', order: 3, description: 'Route high-value loads to manager' },
    { id: 's4', name: 'Send Notification', type: 'NOTIFICATION', order: 4, description: 'Notify stakeholders of approval decision' },
    { id: 's5', name: 'Update Load Status', type: 'ACTION', order: 5, description: 'Update the load record with approval status' },
  ],
  stats: {
    totalExecutions: 1247,
    successfulExecutions: 1178,
    failedExecutions: 69,
    avgDurationMs: 145000,
    executionsToday: 23,
    executionsThisWeek: 156,
  },
  recentExecutions: [
    { id: 'e1', startedAt: new Date(Date.now() - 3600000), status: 'COMPLETED', durationMs: 120000 },
    { id: 'e2', startedAt: new Date(Date.now() - 7200000), status: 'COMPLETED', durationMs: 180000 },
    { id: 'e3', startedAt: new Date(Date.now() - 10800000), status: 'FAILED', durationMs: 45000 },
    { id: 'e4', startedAt: new Date(Date.now() - 14400000), status: 'COMPLETED', durationMs: 130000 },
    { id: 'e5', startedAt: new Date(Date.now() - 18000000), status: 'COMPLETED', durationMs: 155000 },
  ],
};

const stepTypeIcons: Record<string, string> = {
  CONDITION: '❓',
  ACTION: '⚡',
  APPROVAL: '✅',
  NOTIFICATION: '📧',
  DELAY: '⏰',
  INTEGRATION: '🔗',
};

const stepTypeColors: Record<string, string> = {
  CONDITION: 'bg-purple-100 dark:bg-purple-900/30',
  ACTION: 'bg-blue-100 dark:bg-blue-900/30',
  APPROVAL: 'bg-green-100 dark:bg-green-900/30',
  NOTIFICATION: 'bg-yellow-100 dark:bg-yellow-900/30',
  DELAY: 'bg-gray-100 dark:bg-gray-800',
  INTEGRATION: 'bg-red-100 dark:bg-red-900/30',
};

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const workflow = mockWorkflow;
  const successRate = workflow.stats.totalExecutions > 0 
    ? ((workflow.stats.successfulExecutions / workflow.stats.totalExecutions) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/workflows" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronLeftIcon className="h-4 w-4" />
          Workflows
        </Link>
        <span>/</span>
        <span>{workflow.name}</span>
      </div>

      <PageHeader
        title={workflow.name}
        subtitle={workflow.description}
      >
        <div className="flex items-center gap-2">
          <Badge variant={workflow.status === 'ACTIVE' ? 'green' : 'yellow'}>
            {workflow.status}
          </Badge>
          <span className="text-sm text-gray-500">v{workflow.version}</span>
        </div>
        <div className="flex items-center gap-2">
          {workflow.status === 'ACTIVE' ? (
            <Button variant="outline">
              <PauseIcon className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline">
              <PlayIcon className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          <Link href={`/workflows/${workflow.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline">
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Button>
            <BoltIcon className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Executions</p>
              <p className="text-2xl font-semibold">{workflow.stats.totalExecutions.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold">{successRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClockIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Duration</p>
              <p className="text-2xl font-semibold">
                {Math.round(workflow.stats.avgDurationMs / 1000 / 60)} min
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-semibold">{workflow.stats.executionsThisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Steps */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Workflow Steps</h2>
              <Badge variant="gray">{workflow.steps.length} steps</Badge>
            </div>
            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-lg text-xl ${stepTypeColors[step.type]}`}>
                      {stepTypeIcons[step.type]}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-400">Step {step.order}</span>
                      <Badge variant="gray">{step.type}</Badge>
                    </div>
                    <h3 className="font-medium">{step.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trigger Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Trigger</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Type</span>
                <Badge variant="blue">{workflow.triggerType}</Badge>
              </div>
              {workflow.triggerType === 'EVENT' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Event</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {workflow.triggerConfig.event}
                  </code>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Category</span>
                <span>{workflow.category.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </Card>

          {/* Recent Executions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Executions</h2>
              <Link href={`/workflows/${workflow.id}/executions`} className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {workflow.recentExecutions.map(exec => (
                <Link 
                  key={exec.id}
                  href={`/workflows/${workflow.id}/executions/${exec.id}`}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {exec.status === 'COMPLETED' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      {new Date(exec.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(exec.durationMs / 1000)}s
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created by</span>
                <span>{workflow.createdBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last updated</span>
                <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Version</span>
                <span>v{workflow.version}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
