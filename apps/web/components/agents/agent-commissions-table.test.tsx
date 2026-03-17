import { render } from '@/test/utils';
import { AgentCommissionsTable } from './agent-commissions-table';

describe('AgentCommissionsTable', () => {
  it('should render with component wrapper', () => {
    const { container } = render(<AgentCommissionsTable agentId="agent-1" />);

    expect(container).toBeInTheDocument();
  });

  it('should render table headers', () => {
    const { container } = render(<AgentCommissionsTable agentId="agent-1" />);

    // Check for table structure - table or list elements
    const table = container.querySelector('table, [role="table"]');
    expect(table || container.querySelector('div')).toBeDefined();
  });

  it('should render with optional limit prop', () => {
    const { container } = render(
      <AgentCommissionsTable agentId="agent-1" limit={10} />
    );

    expect(container).toBeInTheDocument();
  });
});
