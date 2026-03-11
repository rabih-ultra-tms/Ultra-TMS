'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type {
  ChartOfAccount,
  AccountType,
} from '@/lib/hooks/accounting/use-chart-of-accounts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

const TYPE_LABELS: Record<AccountType, string> = {
  ASSET: 'Asset',
  LIABILITY: 'Liability',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSE: 'Expense',
};

const TYPE_CLASSES: Record<AccountType, string> = {
  ASSET: 'bg-blue-100 text-blue-700 border-blue-200',
  LIABILITY: 'bg-red-100 text-red-700 border-red-200',
  EQUITY: 'bg-purple-100 text-purple-700 border-purple-200',
  REVENUE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EXPENSE: 'bg-amber-100 text-amber-700 border-amber-200',
};

// ---------------------------------------------------------------------------
// Column actions interface
// ---------------------------------------------------------------------------

interface AccountColumnActions {
  onEdit: (account: ChartOfAccount) => void;
  onDelete: (account: ChartOfAccount) => void;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export function getChartOfAccountsColumns(
  actions: AccountColumnActions
): ColumnDef<ChartOfAccount>[] {
  return [
    {
      accessorKey: 'accountNumber',
      header: 'Account #',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-text-primary">
          {row.original.accountNumber}
        </span>
      ),
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }) => (
        <span className="font-semibold text-text-primary">
          {row.original.accountName}
        </span>
      ),
    },
    {
      accessorKey: 'accountType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.accountType;
        return (
          <Badge variant="outline" className={TYPE_CLASSES[type]}>
            {TYPE_LABELS[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'normalBalance',
      header: 'Normal Balance',
      cell: ({ row }) => (
        <span className="text-sm text-text-muted capitalize">
          {row.original.normalBalance.charAt(0) +
            row.original.normalBalance.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.balance)}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <Badge
            variant="outline"
            className={
              active
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }
          >
            {active ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const account = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onEdit(account);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              {!account.isSystemAccount && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.onDelete(account);
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
