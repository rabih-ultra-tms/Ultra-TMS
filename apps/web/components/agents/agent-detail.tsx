'use client';

import { useState } from 'react';
import {
  useAgent,
  useAgentAgreements,
  useAgentLeads,
} from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AgentStatusBadge } from './agent-status-badge';
import { AgentForm } from './agent-form';
import { Button } from '@/components/ui/button';

interface AgentDetailProps {
  agentId: string;
  mode?: 'view' | 'edit';
}

export function AgentDetail({ agentId, mode = 'view' }: AgentDetailProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const { data: agent, isLoading, error } = useAgent(agentId);
  const { data: agreements } = useAgentAgreements(agentId);
  const { data: leads } = useAgentLeads(agentId);

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Agent not found or failed to load.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !agent) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm agentId={agentId} onSuccess={() => setIsEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{agent.companyName}</CardTitle>
            <p className="text-sm text-text-muted">{agent.agentCode}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-text-secondary">Status</p>
              <AgentStatusBadge status={agent.status as any} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">Type</p>
              <Badge variant="outline" className="mt-1">
                {agent.agentType}
              </Badge>
            </div>
            {agent.tier && (
              <div>
                <p className="text-xs font-medium text-text-secondary">Tier</p>
                <Badge variant="secondary" className="mt-1">
                  {agent.tier}
                </Badge>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-text-secondary">Created</p>
              <p className="text-sm text-text-primary">
                {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agreements">
            Agreements
            {agreements && agreements.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {agreements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            {leads?.data && leads.data.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {leads.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    First Name
                  </p>
                  <p className="text-sm text-text-primary">
                    {agent.contactFirstName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Last Name
                  </p>
                  <p className="text-sm text-text-primary">
                    {agent.contactLastName}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-text-secondary">
                    Email
                  </p>
                  <p className="text-sm text-text-primary">
                    {agent.contactEmail}
                  </p>
                </div>
                {agent.contactPhone && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-text-secondary">
                      Phone
                    </p>
                    <p className="text-sm text-text-primary">
                      {agent.contactPhone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          {(agent.addressLine1 || agent.city) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agent.addressLine1 && (
                  <p className="text-sm text-text-primary">
                    {agent.addressLine1}
                  </p>
                )}
                {agent.addressLine2 && (
                  <p className="text-sm text-text-primary">
                    {agent.addressLine2}
                  </p>
                )}
                <p className="text-sm text-text-primary">
                  {agent.city}, {agent.state} {agent.zip}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Agreements Tab */}
        <TabsContent value="agreements">
          {!agreements || agreements.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-text-muted">
                  No agreements found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {agreements.map((agreement) => (
                <Card key={agreement.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {agreement.agreementNumber}
                        </p>
                        <p className="text-sm text-text-muted">
                          {agreement.splitType}
                          {agreement.splitRate && ` - ${agreement.splitRate}%`}
                        </p>
                      </div>
                      <Badge>{agreement.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads">
          {!leads?.data || leads.data.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-text-muted">
                  No leads found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leads.data.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {lead.companyName}
                        </p>
                        <p className="text-sm text-text-muted">{lead.status}</p>
                      </div>
                      <Badge variant="outline">—</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-text-muted">
                No documents available
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
