import { render } from '@/test/utils';
import { AgentsDashboard } from './agents-dashboard';

describe('AgentsDashboard', () => {
  it('should render dashboard component', () => {
    const { container } = render(<AgentsDashboard tenantId="tenant-1" />);

    expect(container).toBeInTheDocument();
    // Component renders without errors
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should display KPI sections', () => {
    const { container } = render(<AgentsDashboard tenantId="tenant-1" />);

    // Check for KPI cards - they render with loading or with data
    const cards = document.querySelectorAll('[class*="rounded-lg"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should accept tenantId prop', () => {
    const { container } = render(<AgentsDashboard tenantId="another-tenant" />);

    expect(container).toBeInTheDocument();
  });
});
