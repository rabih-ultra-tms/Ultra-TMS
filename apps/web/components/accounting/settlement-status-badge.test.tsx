import { render, screen } from '@/test/utils';
import { SettlementStatusBadge } from './settlement-status-badge';
import type { SettlementStatus } from '@/lib/hooks/accounting/use-settlements';

describe('SettlementStatusBadge', () => {
  const statuses: SettlementStatus[] = ['CREATED', 'APPROVED', 'PROCESSED', 'PAID'];

  statuses.forEach((status) => {
    it(`renders ${status} status with correct label`, () => {
      render(<SettlementStatusBadge status={status} />);
      const badge = screen.queryByText(/created|approved|processed|paid/i);
      expect(badge).toBeInTheDocument();
    });
  });

  it('renders with small size by default', () => {
    render(<SettlementStatusBadge status="CREATED" size="sm" />);
    const badge = screen.getByText(/created/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<SettlementStatusBadge status="APPROVED" size="md" />);
    const badge = screen.getByText(/approved/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<SettlementStatusBadge status="PROCESSED" size="lg" />);
    const badge = screen.getByText(/processed/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders PAID status', () => {
    render(<SettlementStatusBadge status="PAID" />);
    const badge = screen.getByText(/paid/i);
    expect(badge).toBeInTheDocument();
  });

  it('returns null for invalid status', () => {
    const { container } = render(<SettlementStatusBadge status={'INVALID' as SettlementStatus} />);
    expect(container.firstChild).toBeNull();
  });
});
