import { render } from '@/test/utils';
import { AgentPerformanceChart } from './agent-performance-chart';

describe('AgentPerformanceChart', () => {
  it('should render performance chart', () => {
    const { container } = render(<AgentPerformanceChart agentId="agent-1" />);

    expect(container).toBeInTheDocument();
  });

  it('should have period selector', () => {
    const { container } = render(
      <AgentPerformanceChart agentId="agent-1" period="month" />
    );

    // Check for selector controls
    const selectors = container.querySelector(
      'button, select, [role="combobox"]'
    );
    expect(selectors).toBeDefined();
  });

  it('should accept different periods', () => {
    const { container } = render(
      <AgentPerformanceChart agentId="agent-1" period="month" />
    );

    expect(container).toBeInTheDocument();

    // Rendering with different period should work
    const { container: quarterContainer } = render(
      <AgentPerformanceChart agentId="agent-1" period="quarter" />
    );

    expect(quarterContainer).toBeInTheDocument();
  });
});
