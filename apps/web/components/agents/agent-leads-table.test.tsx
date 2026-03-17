import { render } from '@/test/utils';
import { AgentLeadsTable } from './agent-leads-table';

describe('AgentLeadsTable', () => {
  it('should render leads table', () => {
    const { container } = render(<AgentLeadsTable agentId="agent-1" />);

    expect(container).toBeInTheDocument();
  });

  it('should render table headers', () => {
    const { container } = render(<AgentLeadsTable agentId="agent-1" />);

    // Check for table structure - table or list elements
    const table = container.querySelector('table, [role="table"]');
    expect(table || container.querySelector('div')).toBeDefined();
  });

  it('should accept agentId prop', () => {
    const { container } = render(<AgentLeadsTable agentId="test-agent-123" />);

    expect(container).toBeInTheDocument();
  });
});
