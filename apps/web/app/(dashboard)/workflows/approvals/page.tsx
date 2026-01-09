'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  FunnelIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Mock approvals data
const mockApprovals = [
  {
    id: 'a1',
    workflowName: 'New Load Approval',
    executionId: 'e2',
    stepName: 'Request Manager Approval',
    entityType: 'LOAD',
    entityId: 'L-001235',
    entityName: 'Load L-001235 - Chicago to LA',
    description: 'High-value load ($15,000) requires manager approval',
    approvalType: 'SINGLE',
    status: 'PENDING',
    requiredApprovers: 1,
    currentApprovals: 0,
    requestedAt: new Date(Date.now() - 7200000),
    requestedBy: 'System',
    dueDate: new Date(Date.now() + 86400000),
    priority: 'HIGH',
    context: {
      loadValue: 15000,
      customer: 'Acme Corp',
      route: 'Chicago, IL → Los Angeles, CA',
    },
  },
  {
    id: 'a2',
    workflowName: 'Carrier Onboarding',
    executionId: 'e10',
    stepName: 'Compliance Review',
    entityType: 'CARRIER',
    entityId: 'C-00089',
    entityName: 'Swift Logistics LLC',
    description: 'New carrier compliance documents need review',
    approvalType: 'SEQUENTIAL',
    status: 'PENDING',
    requiredApprovers: 2,
    currentApprovals: 1,
    requestedAt: new Date(Date.now() - 86400000),
    requestedBy: 'john.smith@example.com',
    dueDate: new Date(Date.now() + 172800000),
    priority: 'MEDIUM',
    context: {
      documents: ['Insurance', 'Authority', 'W9'],
      fleetSize: 25,
    },
  },
  {
    id: 'a3',
    workflowName: 'Invoice Processing',
    executionId: 'e15',
    stepName: 'Finance Approval',
    entityType: 'INVOICE',
    entityId: 'INV-2024-001567',
    entityName: 'Invoice INV-2024-001567',
    description: 'Invoice exceeds auto-approval threshold',
    approvalType: 'SINGLE',
    status: 'PENDING',
    requiredApprovers: 1,
    currentApprovals: 0,
    requestedAt: new Date(Date.now() - 3600000),
    requestedBy: 'System',
    dueDate: new Date(Date.now() + 43200000),
    priority: 'HIGH',
    context: {
      amount: 25000,
      customer: 'Global Shipping Inc',
      loads: 5,
    },
  },
  {
    id: 'a4',
    workflowName: 'Credit Increase',
    executionId: 'e20',
    stepName: 'Credit Manager Review',
    entityType: 'CUSTOMER',
    entityId: 'CUS-00234',
    entityName: 'Premier Freight Co',
    description: 'Request to increase credit limit from $50K to $100K',
    approvalType: 'UNANIMOUS',
    status: 'PENDING',
    requiredApprovers: 3,
    currentApprovals: 0,
    requestedAt: new Date(Date.now() - 172800000),
    requestedBy: 'sales@example.com',
    dueDate: new Date(Date.now() + 259200000),
    priority: 'LOW',
    context: {
      currentLimit: 50000,
      requestedLimit: 100000,
      paymentHistory: 'Excellent',
    },
  },
];

const priorityColors: Record<string, 'red' | 'yellow' | 'blue' | 'gray'> = {
  HIGH: 'red',
  MEDIUM: 'yellow',
  LOW: 'blue',
};

const approvalTypeLabels: Record<string, string> = {
  SINGLE: 'Single Approver',
  SEQUENTIAL: 'Sequential',
  PARALLEL: 'Parallel',
  UNANIMOUS: 'Unanimous',
};

export default function ApprovalsPage() {
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const filteredApprovals = mockApprovals.filter(approval => {
    const matchesPriority = !selectedPriority || approval.priority === selectedPriority;
    const matchesType = !selectedType || approval.entityType === selectedType;
    return matchesPriority && matchesType;
  });

  const stats = {
    pending: mockApprovals.length,
    highPriority: mockApprovals.filter(a => a.priority === 'HIGH').length,
    dueSoon: mockApprovals.filter(a => 
      new Date(a.dueDate).getTime() - Date.now() < 86400000
    ).length,
  };

  const handleApprove = (id: string) => {
    console.log('Approving:', id);
    // In real app, call API
  };

  const handleReject = (id: string) => {
    console.log('Rejecting:', id);
    // In real app, call API
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Approvals"
        subtitle="Review and action pending approval requests"
      >
        <Badge variant="yellow" className="text-sm">
          {stats.pending} Pending
        </Badge>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <InboxIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold">{stats.highPriority}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Due in 24h</p>
              <p className="text-2xl font-semibold">{stats.dueSoon}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Types</option>
            <option value="LOAD">Loads</option>
            <option value="CARRIER">Carriers</option>
            <option value="INVOICE">Invoices</option>
            <option value="CUSTOMER">Customers</option>
          </select>
        </div>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map(approval => (
          <Card key={approval.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={priorityColors[approval.priority]}>{approval.priority}</Badge>
                  <Badge variant="gray">{approval.entityType}</Badge>
                  <span className="text-sm text-gray-500">
                    {approvalTypeLabels[approval.approvalType]}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium mb-1">{approval.entityName}</h3>
                <p className="text-slate-600 mb-3">{approval.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Requested {new Date(approval.requestedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCircleIcon className="h-4 w-4" />
                    by {approval.requestedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    Due {new Date(approval.dueDate).toLocaleDateString()}
                  </span>
                  {approval.currentApprovals > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      {approval.currentApprovals}/{approval.requiredApprovers} approved
                    </span>
                  )}
                </div>

                {/* Context */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Context</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {Object.entries(approval.context).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        <span className="font-medium">
                          {typeof value === 'number' && key.toLowerCase().includes('value') 
                            ? `$${value.toLocaleString()}`
                            : typeof value === 'number' && key.toLowerCase().includes('limit')
                            ? `$${value.toLocaleString()}`
                            : typeof value === 'number' && key.toLowerCase().includes('amount')
                            ? `$${value.toLocaleString()}`
                            : Array.isArray(value) 
                            ? value.join(', ')
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Link 
                    href={`/workflows/approvals/${approval.id}`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View details <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    href={`/workflows/${approval.workflowName.toLowerCase().replace(/ /g, '-')}/executions/${approval.executionId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View workflow
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-6">
                <Button 
                  onClick={() => handleApprove(approval.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleReject(approval.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button variant="ghost" size="sm">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-gray-500">
            You have no pending approvals at this time.
          </p>
        </Card>
      )}
    </div>
  );
}
