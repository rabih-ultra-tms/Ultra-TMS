'use client';

import { use } from 'react';
import { AgentForm } from '@/components/agents/agent-form';
import { useAgent } from '@/lib/hooks/agents/use-agents';

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: agent, isLoading, error } = useAgent(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span>Loading...</span>
      </div>
    );
  }
  if (error || !agent) {
    return (
      <div className="p-12 text-center text-text-muted">Agent not found</div>
    );
  }

  return <AgentForm agent={agent} />;
}
