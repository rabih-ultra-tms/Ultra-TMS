'use client';

import { useRouter } from 'next/navigation';
import {
  useAccountingDashboard,
  useRecentInvoices,
} from '@/lib/hooks/accounting/use-accounting-dashboard';
import { AccDashboardStats } from '@/components/accounting/acc-dashboard-stats';
import { AccRecentInvoices } from '@/components/accounting/acc-recent-invoices';
import {
  FileText,
  DollarSign,
  Truck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const QUICK_LINKS = [
  {
    label: 'Invoices',
    description: 'Manage customer invoices',
    href: '/accounting/invoices',
    icon: FileText,
  },
  {
    label: 'Payments',
    description: 'Track received payments',
    href: '/accounting/payments',
    icon: DollarSign,
  },
  {
    label: 'Settlements',
    description: 'Carrier settlements & payouts',
    href: '/accounting/settlements',
    icon: Truck,
  },
  {
    label: 'Aging Reports',
    description: 'AR/AP aging analysis',
    href: '/accounting/aging',
    icon: BarChart3,
  },
] as const;

export default function AccountingDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading: dashboardLoading } =
    useAccountingDashboard();
  const { data: recentInvoices, isLoading: invoicesLoading } =
    useRecentInvoices();

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Accounting</h1>
        <p className="mt-1 text-sm text-text-muted">
          Financial overview — receivables, payables, and cash flow
        </p>
      </div>

      {/* KPI Cards */}
      <AccDashboardStats data={dashboardData} isLoading={dashboardLoading} />

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Invoices */}
      <AccRecentInvoices
        invoices={recentInvoices}
        isLoading={invoicesLoading}
      />
    </div>
  );
}
