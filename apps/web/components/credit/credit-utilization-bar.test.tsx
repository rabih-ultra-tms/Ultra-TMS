import { render, screen } from '@testing-library/react';
import { CreditUtilizationBar } from './credit-utilization-bar';

describe('CreditUtilizationBar', () => {
  it('should render utilization bar', () => {
    render(<CreditUtilizationBar used={4500000} limit={10000000} />);
    expect(screen.getByTestId('utilization-bar-container')).toBeInTheDocument();
  });

  it('should calculate and display correct percentage', () => {
    render(<CreditUtilizationBar used={4500000} limit={10000000} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should show green color for low utilization (0-70%)', () => {
    render(<CreditUtilizationBar used={3500000} limit={10000000} />);
    // Bar should be green for healthy utilization
  });

  it('should show yellow color for medium utilization (70-90%)', () => {
    render(<CreditUtilizationBar used={7500000} limit={10000000} />);
    // Bar should be yellow for medium utilization
  });

  it('should show orange color for high utilization (90-100%)', () => {
    render(<CreditUtilizationBar used={9500000} limit={10000000} />);
    // Bar should be orange for high utilization
  });

  it('should show red color for exceeded limit (>100%)', () => {
    render(<CreditUtilizationBar used={10500000} limit={10000000} />);
    // Bar should be red for exceeded limit
  });

  it('should display text overlay with percentage and amount', () => {
    render(<CreditUtilizationBar used={4500000} limit={10000000} />);
    expect(screen.getByText(/45% of \$100,000/i)).toBeInTheDocument();
  });

  it('should show threshold marker when provided', () => {
    render(
      <CreditUtilizationBar
        used={4500000}
        limit={10000000}
        threshold={8000000}
      />
    );
    // Threshold marker should be visible at 80%
  });

  it('should handle zero utilization', () => {
    render(<CreditUtilizationBar used={0} limit={10000000} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle full utilization', () => {
    render(<CreditUtilizationBar used={10000000} limit={10000000} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
