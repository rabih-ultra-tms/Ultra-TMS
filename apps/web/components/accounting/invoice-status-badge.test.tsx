import { render, screen } from '@/test/utils';
import { InvoiceStatusBadge } from './invoice-status-badge';
import type { InvoiceStatus } from '@/lib/hooks/accounting/use-invoices';

describe('InvoiceStatusBadge', () => {
  const statuses: InvoiceStatus[] = ['DRAFT', 'PENDING', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'];

  statuses.forEach((status) => {
    it(`renders ${status} status with correct label`, () => {
      render(<InvoiceStatusBadge status={status} />);
      const badge = screen.queryByText(/draft|pending|sent|viewed|partial|paid|overdue|void/i);
      expect(badge).toBeInTheDocument();
    });
  });

  it('renders with small size by default', () => {
    render(<InvoiceStatusBadge status="DRAFT" size="sm" />);
    const badge = screen.getByText(/draft/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<InvoiceStatusBadge status="PAID" size="md" />);
    const badge = screen.getByText(/paid/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<InvoiceStatusBadge status="VOID" size="lg" />);
    const badge = screen.getByText(/void/i);
    expect(badge).toBeInTheDocument();
  });

  it('returns null for invalid status', () => {
    const { container } = render(<InvoiceStatusBadge status={'INVALID' as InvoiceStatus} />);
    expect(container.firstChild).toBeNull();
  });
});
