'use client';

import { useRouter } from 'next/navigation';
import { useCommissionDashboard } from '@/lib/hooks/commissions/use-commission-dashboard';
import { CommissionDashboardStats } from '@/components/commissions/commission-dashboard-stats';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  FileText,
  Receipt,
  Banknote,
  BarChart3,
  ArrowRight,
  Trophy,
} from 'lucide-react';

const QUICK_LINKS = [
  {
    label: 'Sales Reps',
    description: 'Manage reps & assignments',
    href: '/commissions/reps',
    icon: Users,
  },
  {
    label: 'Plans',
    description: 'Commission plan templates',
    href: '/commissions/plans',
    icon: FileText,
  },
  {
    label: 'Transactions',
    description: 'All commission entries',
    href: '/commissions/transactions',
    icon: Receipt,
  },
  {
    label: 'Payouts',
    description: 'Process & track payouts',
    href: '/commissions/payouts',
    icon: Banknote,
  },
  {
    label: 'Reports',
    description: 'Earnings & performance',
    href: '/commissions/reports',
    icon: BarChart3,
  },
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CommissionDashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useCommissionDashboard();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Commissions</h1>
        <p className="mt-1 text-sm text-text-muted">
          Sales commission tracking — pending, paid, and rep performance
        </p>
      </div>

      {/* KPI Cards */}
      <CommissionDashboardStats data={data} isLoading={isLoading} />

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-text-primary">
                  {link.label}
                </span>
                <p className="text-xs text-text-muted">{link.description}</p>
              </div>
              <ArrowRight className="size-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>

      {/* Top Performing Reps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-yellow-500" />
            Top Performing Reps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.topReps?.length ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No commission data available yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Paid MTD</TableHead>
                  <TableHead className="text-right">Paid YTD</TableHead>
                  <TableHead className="text-right">Loads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topReps.slice(0, 5).map((rep, index) => (
                  <TableRow
                    key={rep.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/commissions/reps/${rep.id}`)}
                  >
                    <TableCell className="font-medium text-text-muted">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-text-primary">
                          {rep.name}
                        </span>
                        <p className="text-xs text-text-muted">{rep.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(rep.pendingAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(rep.paidMTD)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(rep.paidYTD)}
                    </TableCell>
                    <TableCell className="text-right text-text-muted">
                      {rep.loadCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
