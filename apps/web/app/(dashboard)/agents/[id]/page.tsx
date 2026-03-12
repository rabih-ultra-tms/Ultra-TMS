'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Users,
  DollarSign,
  Pencil,
  Trash2,
  Play,
  Pause,
  XCircle,
} from 'lucide-react';
import { DetailPage } from '@/components/patterns/detail-page';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAgent,
  useDeleteAgent,
  useActivateAgent,
  useSuspendAgent,
  useTerminateAgent,
} from '@/lib/hooks/agents/use-agents';
import { AgentOverviewTab } from '@/components/agents/agent-overview-tab';
import { AgentAgreementsTab } from '@/components/agents/agent-agreements-tab';
import { AgentCustomersTab } from '@/components/agents/agent-customers-tab';
import { AgentCommissionsTab } from '@/components/agents/agent-commissions-tab';

// ===========================
// Status / Type Labels
// ===========================

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  PENDING: 'outline',
  SUSPENDED: 'secondary',
  TERMINATED: 'destructive',
};

const typeLabels: Record<string, string> = {
  W2: 'W-2 Agent',
  '1099': '1099 Agent',
  INDEPENDENT: 'Independent',
  AGENCY: 'Agency',
};

const tierLabels: Record<string, string> = {
  PLATINUM: 'Platinum',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE: 'Bronze',
};

// ===========================
// Page Component
// ===========================

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: agent, isLoading, error, refetch } = useAgent(id);
  const deleteAgent = useDeleteAgent();
  const activateAgent = useActivateAgent();
  const suspendAgent = useSuspendAgent();
  const terminateAgent = useTerminateAgent();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteAgent.mutateAsync(id);
    router.push('/agents');
  };

  // --- Tabs ---
  const tabs = agent
    ? [
        {
          value: 'overview',
          label: 'Overview',
          icon: Building2,
          content: <AgentOverviewTab agent={agent} agentId={id} />,
        },
        {
          value: 'agreements',
          label: 'Agreements',
          icon: FileText,
          content: <AgentAgreementsTab agentId={id} />,
        },
        {
          value: 'customers',
          label: 'Customers',
          icon: Users,
          content: <AgentCustomersTab agentId={id} />,
        },
        {
          value: 'commissions',
          label: 'Commissions',
          icon: DollarSign,
          content: <AgentCommissionsTab agentId={id} />,
        },
      ]
    : [];

  // --- Breadcrumb ---
  const breadcrumb = (
    <div className="flex items-center gap-1.5">
      <Link href="/agents" className="hover:text-foreground transition-colors">
        Agents
      </Link>
      <span>&gt;</span>
      <span className="text-foreground font-medium">
        {agent?.companyName || 'Agent Details'}
      </span>
    </div>
  );

  // --- Status Badge ---
  const statusBadge = agent ? (
    <>
      <Badge variant={statusVariant[agent.status] || 'outline'}>
        {agent.status}
      </Badge>
      {agent.tier && (
        <Badge variant="secondary" className="text-xs">
          {tierLabels[agent.tier] || agent.tier}
        </Badge>
      )}
    </>
  ) : null;

  // --- Subtitle ---
  const subtitle = agent ? (
    <>
      <span>{typeLabels[agent.agentType] || agent.agentType}</span>
      <span className="mx-1">&middot;</span>
      <span className="font-mono">{agent.agentCode}</span>
      {agent.tier && (
        <>
          <span className="mx-1">&middot;</span>
          <span>{tierLabels[agent.tier] || agent.tier}</span>
        </>
      )}
    </>
  ) : null;

  // --- Actions ---
  const actions = agent ? (
    <div className="flex items-center gap-2">
      {agent.status !== 'ACTIVE' && agent.status !== 'TERMINATED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => activateAgent.mutate(id)}
          disabled={activateAgent.isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          Activate
        </Button>
      )}
      {agent.status === 'ACTIVE' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            suspendAgent.mutate({ id, reason: 'Suspended by admin' })
          }
          disabled={suspendAgent.isPending}
        >
          <Pause className="mr-2 h-4 w-4" />
          Suspend
        </Button>
      )}
      {agent.status !== 'TERMINATED' && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() =>
            terminateAgent.mutate({ id, reason: 'Terminated by admin' })
          }
          disabled={terminateAgent.isPending}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Terminate
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/agents/${id}/edit`)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ) : null;

  return (
    <>
      <DetailPage
        title={agent?.companyName || 'Loading...'}
        subtitle={subtitle}
        tags={statusBadge}
        breadcrumb={breadcrumb}
        backLink="/agents"
        backLabel="Back to Agents"
        actions={actions}
        tabs={tabs}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Agent"
        description={`Are you sure you want to delete ${agent?.companyName ?? 'this agent'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleteAgent.isPending}
      />
    </>
  );
}
