'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlayIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock execution detail
const mockExecution = {
  id: 'e1',
  workflowId: '1',
  workflowName: 'New Load Approval',
  workflowVersion: 3,
  status: 'COMPLETED',
  triggerType: 'EVENT',
  triggeredBy: 'System',
  inputData: { 
    loadId: 'L-001234', 
    value: 8500,
    origin: 'Chicago, IL',
    destination: 'Los Angeles, CA',
    customer: 'Acme Corp',
  },
  outputData: {
    approved: true,
    approvalType: 'AUTO',
    approvedBy: 'System',
  },
  startedAt: new Date(Date.now() - 3600000),
  completedAt: new Date(Date.now() - 3480000),
  durationMs: 120000,
  stepExecutions: [
    {
      id: 's1',
      stepName: 'Check Load Value',
      stepType: 'CONDITION',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3590000),
      durationMs: 10000,
      inputData: { loadValue: 8500, threshold: 10000 },
      outputData: { result: 'BELOW_THRESHOLD', branch: 'auto_approve' },
    },
    {
      id: 's2',
      stepName: 'Auto-Approve Standard',
      stepType: 'ACTION',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3590000),
      completedAt: new Date(Date.now() - 3560000),
      durationMs: 30000,
      inputData: { loadId: 'L-001234', action: 'APPROVE' },
      outputData: { status: 'APPROVED', timestamp: new Date(Date.now() - 3560000).toISOString() },
    },
    {
      id: 's3',
      stepName: 'Request Manager Approval',
      stepType: 'APPROVAL',
      status: 'SKIPPED',
      startedAt: null,
      completedAt: null,
      durationMs: null,
      skipReason: 'Condition not met (auto-approved)',
    },
    {
      id: 's4',
      stepName: 'Send Notification',
      stepType: 'NOTIFICATION',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3560000),
      completedAt: new Date(Date.now() - 3520000),
      durationMs: 40000,
      inputData: { recipients: ['dispatcher@example.com'], template: 'load_approved' },
      outputData: { sent: true, messageId: 'msg_abc123' },
    },
    {
      id: 's5',
      stepName: 'Update Load Status',
      stepType: 'ACTION',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3520000),
      completedAt: new Date(Date.now() - 3480000),
      durationMs: 40000,
      inputData: { loadId: 'L-001234', newStatus: 'APPROVED' },
      outputData: { updated: true },
    },
  ],
};

const stepTypeColors: Record<string, string> = {
  CONDITION: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
  ACTION: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
  APPROVAL: 'bg-green-100 dark:bg-green-900/30 border-green-300',
  NOTIFICATION: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300',
  DELAY: 'bg-gray-100 dark:bg-gray-800 border-gray-300',
  INTEGRATION: 'bg-red-100 dark:bg-red-900/30 border-red-300',
};

const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'blue' | 'gray'> = {
  COMPLETED: 'green',
  FAILED: 'red',
  RUNNING: 'blue',
  SKIPPED: 'gray',
  PENDING: 'gray',
};

export default function ExecutionDetailPage({ 
  params 
}: { 
  params: { id: string; executionId: string } 
}) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const execution = mockExecution;
  
  const completedSteps = execution.stepExecutions.filter(s => s.status === 'COMPLETED').length;
  const totalSteps = execution.stepExecutions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/workflows" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronLeftIcon className="h-4 w-4" />
          Workflows
        </Link>
        <span>/</span>
        <Link href={`/workflows/${params.id}`} className="hover:text-blue-600">
          {execution.workflowName}
        </Link>
        <span>/</span>
        <Link href={`/workflows/${params.id}/executions`} className="hover:text-blue-600">
          Executions
        </Link>
        <span>/</span>
        <span>{execution.id}</span>
      </div>

      <PageHeader
        title={`Execution ${execution.id}`}
        subtitle={`${execution.workflowName} v${execution.workflowVersion}`}
      >
        <Badge variant={statusColors[execution.status]} className="text-sm">
          {execution.status === 'COMPLETED' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
          {execution.status === 'FAILED' && <XCircleIcon className="h-4 w-4 mr-1" />}
          {execution.status === 'RUNNING' && <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />}
          {execution.status}
        </Badge>
        {execution.status === 'FAILED' && (
          <Button>
            <PlayIcon className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Execution Timeline</h2>
            <div className="space-y-4">
              {execution.stepExecutions.map((step, index) => (
                <div 
                  key={step.id}
                  className={`relative flex items-start gap-4 cursor-pointer ${
                    selectedStep === step.id ? 'bg-gray-50 dark:bg-gray-800 -mx-4 px-4 py-2 rounded-lg' : ''
                  }`}
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                >
                  {/* Connector Line */}
                  {index < execution.stepExecutions.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  {/* Status Icon */}
                  <div className={`z-10 p-2 rounded-full border-2 ${stepTypeColors[step.stepType]}`}>
                    {step.status === 'COMPLETED' && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                    {step.status === 'FAILED' && <XCircleIcon className="h-5 w-5 text-red-600" />}
                    {step.status === 'RUNNING' && <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />}
                    {step.status === 'SKIPPED' && <ClockIcon className="h-5 w-5 text-gray-400" />}
                    {step.status === 'PENDING' && <ClockIcon className="h-5 w-5 text-gray-400" />}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{step.stepName}</span>
                      <Badge variant={statusColors[step.status]}>{step.status}</Badge>
                      <Badge variant="gray">{step.stepType}</Badge>
                    </div>
                    
                    {step.durationMs && (
                      <p className="text-sm text-gray-500">
                        Duration: {Math.round(step.durationMs / 1000)}s
                        {step.startedAt && (
                          <span className="ml-2">
                            • Started {new Date(step.startedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </p>
                    )}
                    
                    {step.skipReason && (
                      <p className="text-sm text-gray-500 italic">{step.skipReason}</p>
                    )}

                    {/* Expanded Details */}
                    {selectedStep === step.id && step.status !== 'SKIPPED' && (
                      <div className="mt-4 space-y-3">
                        {step.inputData && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Input</p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(step.inputData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {step.outputData && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Output</p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(step.outputData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={statusColors[execution.status]}>{execution.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Progress</span>
                <span>{completedSteps}/{totalSteps} steps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Trigger</span>
                <Badge variant="blue">{execution.triggerType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Triggered by</span>
                <span>{execution.triggeredBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{Math.round(execution.durationMs / 1000)}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Started</span>
                <span className="text-sm">{new Date(execution.startedAt).toLocaleString()}</span>
              </div>
              {execution.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-sm">{new Date(execution.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Input Data */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Input Data
            </h2>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(execution.inputData, null, 2)}
            </pre>
          </Card>

          {/* Output Data */}
          {execution.outputData && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Output Data
              </h2>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(execution.outputData, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
