'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Agent } from '@/lib/hooks/agents/use-agents';
import { useAgentContacts } from '@/lib/hooks/agents/use-agents';
import { useAgentPerformance } from '@/lib/hooks/agents/use-agent-commissions';
import { Mail, Phone, User } from 'lucide-react';

// ===========================
// Helpers
// ===========================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatAddress(agent: Agent): string | null {
  const parts = [
    agent.addressLine1,
    agent.addressLine2,
    agent.city,
    agent.state && agent.zip
      ? `${agent.state} ${agent.zip}`
      : agent.state || agent.zip,
    agent.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

// ===========================
// Component
// ===========================

interface AgentOverviewTabProps {
  agent: Agent;
  agentId: string;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: import('react').ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">
        {value || '—'}
      </span>
    </div>
  );
}

export function AgentOverviewTab({ agent, agentId }: AgentOverviewTabProps) {
  const { data: contacts, isLoading: contactsLoading } =
    useAgentContacts(agentId);
  const { data: performance, isLoading: perfLoading } =
    useAgentPerformance(agentId);

  const address = formatAddress(agent);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Agent Info Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Company Name" value={agent.companyName} />
            <InfoRow label="DBA Name" value={agent.dbaName} />
            <InfoRow
              label="Agent Code"
              value={<span className="font-mono">{agent.agentCode}</span>}
            />
            <InfoRow label="Type" value={agent.agentType} />
            <InfoRow label="Tier" value={agent.tier} />
            <InfoRow label="Legal Entity" value={agent.legalEntityType} />
            <InfoRow label="Tax ID" value={agent.taxId} />
            <InfoRow label="Address" value={address} />
            <InfoRow
              label="Contact Name"
              value={`${agent.contactFirstName} ${agent.contactLastName}`}
            />
            <InfoRow label="Email" value={agent.contactEmail} />
            <InfoRow label="Phone" value={agent.contactPhone} />
            <InfoRow label="Payment Method" value={agent.paymentMethod} />
            <InfoRow label="Bank Name" value={agent.bankName} />
            <InfoRow
              label="Bank Account"
              value={
                agent.bankAccount
                  ? `****${agent.bankAccount.slice(-4)} (${agent.bankAccountType || 'N/A'})`
                  : null
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !contacts || contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts found.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {contact.firstName} {contact.lastName}
                      </span>
                      {contact.isPrimary && (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Primary
                        </Badge>
                      )}
                      {contact.role && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {contact.role}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : !performance ? (
            <p className="text-sm text-muted-foreground">
              No performance data available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Total Commissions"
                value={formatCurrency(performance.totalCommissions)}
              />
              <InfoRow
                label="Total Paid"
                value={formatCurrency(performance.totalPaid)}
              />
              <InfoRow
                label="Avg Commission"
                value={formatCurrency(performance.avgCommission)}
              />
              <InfoRow
                label="Load Count"
                value={performance.loadCount.toLocaleString()}
              />
              <InfoRow
                label="Pending Amount"
                value={formatCurrency(performance.pendingAmount)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
