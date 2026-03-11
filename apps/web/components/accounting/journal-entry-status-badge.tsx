'use client';

import { StatusBadge } from '@/components/tms/primitives/status-badge';
import { JOURNAL_ENTRY_STATUSES } from '@/lib/design-tokens';
import type { JournalEntryStatus } from '@/lib/hooks/accounting/use-journal-entries';

interface JournalEntryStatusBadgeProps {
  status: JournalEntryStatus;
  size?: 'sm' | 'md';
}

export function JournalEntryStatusBadge({
  status,
  size = 'sm',
}: JournalEntryStatusBadgeProps) {
  const config = JOURNAL_ENTRY_STATUSES[status];
  if (!config) return null;

  return (
    <StatusBadge
      status={config.status ?? undefined}
      intent={config.intent ?? undefined}
      size={size}
      withDot
      className={config.className ?? undefined}
    >
      {config.label}
    </StatusBadge>
  );
}
