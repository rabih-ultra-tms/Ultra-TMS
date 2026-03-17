'use client';

import { use, Suspense, useState } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus } from 'lucide-react';
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton';
import { useAgent } from '@/lib/hooks/agents';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load portal access settings
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please refresh the page or contact support.
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}

function PortalAccessContent({ id }: { id: string }) {
  const { data: agent, isLoading, error } = useAgent(id);
  const [portalUsers] = useState<
    Array<{
      id: string;
      email: string;
      fullName: string;
      role: string;
      lastLogin?: string;
      isActive: boolean;
    }>
  >([]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !agent) {
    return <ErrorFallback />;
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/agents/${id}`}>
              <ChevronLeft className="size-4 mr-1" />
              Back to Agent
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {agent.companyName} - Portal Access
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage external agent portal users and access permissions
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link
          href="/agents"
          className="hover:text-foreground transition-colors"
        >
          Agents
        </Link>
        {' > '}
        <Link
          href={`/agents/${id}`}
          className="hover:text-foreground transition-colors"
        >
          {agent.companyName}
        </Link>
        {' > '}
        <span className="text-foreground font-medium">Portal Access</span>
      </nav>

      {/* Portal Settings Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Agent can access portal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portal Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portalUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active user accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Not available</div>
            <p className="text-xs text-muted-foreground mt-2">
              No login activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portal Users Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Portal User Accounts</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/agents/${id}/portal-access/new`}>
              <Plus className="size-4 mr-1" />
              Add User
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {portalUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No portal users configured
              </p>
              <Button asChild>
                <Link href={`/agents/${id}/portal-access/new`}>
                  <Plus className="size-4 mr-1" />
                  Create First User
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portalUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-sm">{user.role}</TableCell>
                      <TableCell className="text-sm">
                        {user.lastLogin || 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal Configuration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Portal Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Portal Access URL</p>
            <p className="text-sm text-muted-foreground font-mono">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/agent-portal`
                : 'https://your-domain.com/agent-portal'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Available Features</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View sourced loads and commissions</li>
              <li>• Track performance metrics</li>
              <li>• Download statements and reports</li>
              <li>• Manage contact information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentPortalAccessPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<DetailPageSkeleton />}>
        <PortalAccessContent id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
