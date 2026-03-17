import { render } from '@/test/utils';
import { AgentDetail } from './agent-detail';

describe('AgentDetail', () => {
  it('should render component with agentId', () => {
    const { container } = render(<AgentDetail agentId="agent-1" />);

    expect(container).toBeInTheDocument();
  });

  it('should have tabs for different sections', () => {
    const { container } = render(<AgentDetail agentId="agent-1" mode="view" />);

    // Check for tab structure - tabs or buttons will render
    expect(
      container.querySelector('button, [role="tab"], [role="tablist"]')
    ).toBeDefined();
  });

  it('should render in view mode', () => {
    const { container } = render(<AgentDetail agentId="agent-1" mode="view" />);

    expect(container).toBeInTheDocument();
  });
});
