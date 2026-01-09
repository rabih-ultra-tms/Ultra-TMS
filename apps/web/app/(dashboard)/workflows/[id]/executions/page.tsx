'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock executions data
const mockExecutions = [
  {
    id: 'e1',
    workflowId: '1',
    workflowName: 'New Load Approval',
    triggerType: 'EVENT',
    triggeredBy: 'System',
    inputData: { loadId: 'L-001234', value: 8500 },
    status: 'COMPLETED',
    currentStepIndex: 5,
    totalSteps: 5,
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3480000),
    durationMs: 120000,
  },
  {
    id: 'e2',
    workflowId: '1',
    workflowName: 'New Load Approval',
    triggerType: 'EVENT',
    triggeredBy: 'System',
    inputData: { loadId: 'L-001235', value: 15000 },
    status: 'WAITING_APPROVAL',
    currentStepIndex: 3,
    totalSteps: 5,
    startedAt: new Date(Date.now() - 7200000),
    completedAt: null,
    durationMs: null,
  },
  {
    id: 'e3',
    workflowId: '1',
    workflowName: 'New Load Approval',
    triggerType: 'MANUAL',
    triggeredBy: 'john.smith@example.com',
    inputData: { loadId: 'L-001236', value: 22000 },
    status: 'FAILED',
    currentStepIndex: 2,
    totalSteps: 5,
    startedAt: new Date(Date.now() - 10800000),
    completedAt: new Date(Date.now() - 10755000),
    durationMs: 45000,
    error: 'Integration timeout: Unable to reach external API',
  },
  {
    id: 'e4',
    workflowId: '1',
    workflowName: 'New Load Approval',
    triggerType: 'EVENT',
    triggeredBy: 'System',
    inputData: { loadId: 'L-001237', value: 5200 },
    status: 'COMPLETED',
    currentStepIndex: 5,
    totalSteps: 5,
    startedAt: new Date(Date.now() - 14400000),
    completedAt: new Date(Date.now() - 14270000),
    durationMs: 130000,
  },
  {
    id: 'e5',
    workflowId: '1',
    workflowName: 'New Load Approval',
    triggerType: 'EVENT',
    triggeredBy: 'System',
    inputData: { loadId: 'L-001238', value: 7800 },
    status: 'RUNNING',
    currentStepIndex: 2,
    totalSteps: 5,
    startedAt: new Date(Date.now() - 60000),
    completedAt: null,
    durationMs: null,
  },
];

const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'blue' | 'gray'> = {
  COMPLETED: 'green',
  FAILED: 'red',
  RUNNING: 'blue',
  WAITING_APPROVAL: 'yellow',
  CANCELLED: 'gray',
  PENDING: 'gray',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  COMPLETED: CheckCircleIcon,
  FAILED: XCircleIcon,
  RUNNING: ArrowPathIcon,
  WAITING_APPROVAL: ClockIcon,
  CANCELLED: StopIcon,
  PENDING: ClockIcon,
};

export default function ExecutionsPage({ params }: { params: { id: string } }) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');

  const filteredExecutions = mockExecutions.filter(exec => {
    const matchesStatus = !selectedStatus || exec.status === selectedStatus;
    const matchesTrigger = !selectedTrigger || exec.triggerType === selectedTrigger;
    return matchesStatus && matchesTrigger;
  });

  const stats = {
    total: mockExecutions.length,
    running: mockExecutions.filter(e => e.status === 'RUNNING').length,
    completed: mockExecutions.filter(e => e.status === 'COMPLETED').length,
    failed: mockExecutions.filter(e => e.status === 'FAILED').length,
    waiting: mockExecutions.filter(e => e.status === 'WAITING_APPROVAL').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/workflows" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronLeftIcon className="h-4 w-4" />
          Workflows
        </Link>
        <span>/</span>
        <Link href={`/workflows/${params.id}`} className="hover:text-blue-600">
          {mockExecutions[0]?.workflowName}
        </Link>
        <span>/</span>
        <span>Executions</span>
      </div>

      <PageHeader
        title="Workflow Executions"
        subtitle={`Execution history for ${mockExecutions[0]?.workflowName}`}
      >
        <Button variant="outline">
          <FunnelIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Running</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.running}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-2xl font-semibold text-yellow-600">{stats.waiting}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="WAITING_APPROVAL">Waiting Approval</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={selectedTrigger}
            onChange={(e) => setSelectedTrigger(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Triggers</option>
            <option value="EVENT">Event</option>
            <option value="MANUAL">Manual</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="API">API</option>
          </select>
        </div>
      </Card>

      {/* Executions Table */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Execution ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Trigger</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Started</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredExecutions.map(exec => {
              const StatusIcon = statusIcons[exec.status] || ClockIcon;
              const progressPercent = (exec.currentStepIndex / exec.totalSteps) * 100;
              
              return (
                <tr key={exec.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[exec.status]}>
                      <StatusIcon className={`h-3 w-3 mr-1 ${exec.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      {exec.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/workflows/${params.id}/executions/${exec.id}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {exec.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <span className="font-medium">{exec.triggerType}</span>
                      <p className="text-gray-500 text-xs">{exec.triggeredBy}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Step {exec.currentStepIndex}/{exec.totalSteps}</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${exec.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(exec.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {exec.durationMs 
                      ? `${Math.round(exec.durationMs / 1000)}s`
                      : exec.status === 'RUNNING' 
                        ? 'Running...'
                        : '-'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/workflows/${params.id}/executions/${exec.id}`}>
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      {exec.status === 'RUNNING' && (
                        <Button variant="ghost" size="sm" title="Cancel">
                          <StopIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      {exec.status === 'FAILED' && (
                        <Button variant="ghost" size="sm" title="Retry">
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {filteredExecutions.length === 0 && (
        <Card className="p-12 text-center">
          <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No executions found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or trigger the workflow manually.
          </p>
        </Card>
      )}
    </div>
  );
}
