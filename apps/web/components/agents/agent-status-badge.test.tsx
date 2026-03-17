import { render, screen } from '@testing-library/react';
import { AgentStatusBadge } from './agent-status-badge';

describe('AgentStatusBadge', () => {
  it('should render with ACTIVE status', () => {
    render(<AgentStatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render with PENDING status', () => {
    render(<AgentStatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render with SUSPENDED status', () => {
    render(<AgentStatusBadge status="SUSPENDED" />);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('should render with TERMINATED status', () => {
    render(<AgentStatusBadge status="TERMINATED" />);
    expect(screen.getByText('Terminated')).toBeInTheDocument();
  });

  it('should apply correct variant for each status', () => {
    const { rerender } = render(<AgentStatusBadge status="ACTIVE" />);
    let badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-primary');

    rerender(<AgentStatusBadge status="PENDING" />);
    badge = screen.getByText('Pending');
    expect(badge).toHaveClass('border');

    rerender(<AgentStatusBadge status="SUSPENDED" />);
    badge = screen.getByText('Suspended');
    expect(badge).toHaveClass('bg-secondary');

    rerender(<AgentStatusBadge status="TERMINATED" />);
    badge = screen.getByText('Terminated');
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should accept custom className', () => {
    render(<AgentStatusBadge status="ACTIVE" className="custom-class" />);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('custom-class');
  });
});
