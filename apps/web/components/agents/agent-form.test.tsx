import { render } from '@/test/utils';
import { AgentForm } from './agent-form';

describe('AgentForm', () => {
  it('should render create form when no agent provided', () => {
    const { container } = render(<AgentForm />);

    expect(container).toBeInTheDocument();
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should render form sections', () => {
    const { container } = render(<AgentForm />);

    // Verify form structure renders
    const formElement = container.querySelector('form');
    expect(formElement).toBeInTheDocument();
  });

  it('should have form inputs', () => {
    const { container } = render(<AgentForm />);

    // Check for input elements
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should render submit button', () => {
    const { container } = render(<AgentForm />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should accept onSuccess callback', () => {
    const onSuccess = () => {};
    const { container } = render(<AgentForm onSuccess={onSuccess} />);

    expect(container).toBeInTheDocument();
  });

  it('should accept agentId prop', () => {
    const { container } = render(<AgentForm agentId="agent-1" />);

    expect(container).toBeInTheDocument();
  });
});
