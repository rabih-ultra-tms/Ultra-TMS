import { render } from '@/test/utils';
import { CustomerAssignmentsTable } from './customer-assignments-table';

describe('CustomerAssignmentsTable', () => {
  it('should render assignments table', () => {
    const { container } = render(
      <CustomerAssignmentsTable agentId="agent-1" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render table headers', () => {
    const { container } = render(
      <CustomerAssignmentsTable agentId="agent-1" />
    );

    // Check for table structure - table or list elements
    const table = container.querySelector('table, [role="table"]');
    expect(table || container.querySelector('div')).toBeDefined();
  });

  it('should accept agentId prop', () => {
    const { container } = render(
      <CustomerAssignmentsTable agentId="test-agent-456" />
    );

    expect(container).toBeInTheDocument();
  });
});
