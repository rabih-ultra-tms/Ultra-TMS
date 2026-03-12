import { render, screen } from '@/test/utils';
import { PaymentStatusBadge } from './payment-status-badge';

describe('PaymentStatusBadge', () => {
  it('renders PENDING status', () => {
    render(<PaymentStatusBadge status="PENDING" />);
    const badge = screen.getByText(/pending/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders APPLIED status', () => {
    render(<PaymentStatusBadge status="APPLIED" />);
    const badge = screen.getByText(/applied/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders PARTIAL status', () => {
    render(<PaymentStatusBadge status="PARTIAL" />);
    const badge = screen.getByText(/partial/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders VOIDED status', () => {
    render(<PaymentStatusBadge status="VOIDED" />);
    const badge = screen.getByText(/voided/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with small size by default', () => {
    render(<PaymentStatusBadge status="PENDING" size="sm" />);
    const badge = screen.getByText(/pending/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<PaymentStatusBadge status="APPLIED" size="md" />);
    const badge = screen.getByText(/applied/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<PaymentStatusBadge status="VOIDED" size="lg" />);
    const badge = screen.getByText(/voided/i);
    expect(badge).toBeInTheDocument();
  });

  it('returns null for invalid status', () => {
    const { container } = render(<PaymentStatusBadge status={'INVALID' as any} />);
    expect(container.firstChild).toBeNull();
  });
});
