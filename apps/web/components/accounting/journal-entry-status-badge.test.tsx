import { render, screen } from '@/test/utils';
import { JournalEntryStatusBadge } from './journal-entry-status-badge';
import type { JournalEntryStatus } from '@/lib/hooks/accounting/use-journal-entries';

describe('JournalEntryStatusBadge', () => {
  const statuses: JournalEntryStatus[] = ['DRAFT', 'POSTED'];

  statuses.forEach((status) => {
    it(`renders ${status} status with correct label`, () => {
      render(<JournalEntryStatusBadge status={status} />);
      const badge = screen.queryByText(/draft|posted/i);
      expect(badge).toBeInTheDocument();
    });
  });

  it('renders with small size by default', () => {
    render(<JournalEntryStatusBadge status="DRAFT" size="sm" />);
    const badge = screen.getByText(/draft/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<JournalEntryStatusBadge status="POSTED" size="md" />);
    const badge = screen.getByText(/posted/i);
    expect(badge).toBeInTheDocument();
  });

  it('returns null for invalid status', () => {
    const { container } = render(<JournalEntryStatusBadge status={'INVALID' as JournalEntryStatus} />);
    expect(container.firstChild).toBeNull();
  });
});
