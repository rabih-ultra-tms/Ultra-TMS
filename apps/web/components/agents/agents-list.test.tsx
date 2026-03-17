import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentsList } from './agents-list';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AgentsList', () => {
  it('should render agents list component', () => {
    const { container } = render(<AgentsList tenantId="tenant-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it('should accept tenantId prop', () => {
    render(<AgentsList tenantId="test-tenant-123" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Agents')).toBeInTheDocument();
  });

  it('should accept onSelect callback', () => {
    const onSelect = (id: string) => {
      console.log('Selected:', id);
    };

    render(<AgentsList tenantId="tenant-1" onSelect={onSelect} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Agents')).toBeInTheDocument();
  });
});
