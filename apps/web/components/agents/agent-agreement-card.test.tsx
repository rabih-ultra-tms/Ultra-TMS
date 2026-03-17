import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentAgreementCard } from './agent-agreement-card';
import type { AgentAgreement } from '@/lib/hooks/agents';

const mockAgreement: AgentAgreement = {
  id: 'agreement-1',
  agentId: 'agent-1',
  agreementNumber: 'AGR001',
  effectiveDate: '2024-01-15T08:00:00Z',
  expirationDate: '2025-01-15T08:00:00Z',
  splitType: 'PERCENTAGE',
  splitRate: 80,
  minimumPayout: 5000,
  minimumPerLoad: 50,
  status: 'ACTIVE',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-03-15T08:00:00Z',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AgentAgreementCard', () => {
  it('should render agreement information', () => {
    render(<AgentAgreementCard agreement={mockAgreement} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('AGR001')).toBeInTheDocument();
    expect(screen.getByText('PERCENTAGE')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    render(<AgentAgreementCard agreement={mockAgreement} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('should show agreement details', () => {
    render(<AgentAgreementCard agreement={mockAgreement} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Effective Date')).toBeInTheDocument();
    expect(screen.getByText('Split Rate')).toBeInTheDocument();
  });

  it('should show edit button when editable', () => {
    render(<AgentAgreementCard agreement={mockAgreement} editable={true} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });
});
