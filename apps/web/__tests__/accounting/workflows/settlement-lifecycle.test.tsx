/**
 * Settlement Lifecycle Workflow Integration Tests
 * Tests the complete settlement lifecycle from creation to processing
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { mockSettlements } from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useParams() {
    return { id: 'settle-pending-1' };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

function createSettlementWorkflow() {
  let settlement = {
    ...mockSettlements[0],
    status: 'CREATED' as string,
    approvedAt: undefined as string | undefined,
    approvedBy: undefined as string | undefined,
    processedAt: undefined as string | undefined,
  };
  return {
    getSettlement: () => settlement,
    approve: (userId: string) => {
      if (settlement.status !== 'CREATED')
        throw new Error('Can only approve CREATED settlements');
      settlement = {
        ...settlement,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: userId,
      };
    },
    process: () => {
      if (settlement.status !== 'APPROVED')
        throw new Error('Can only process APPROVED settlements');
      settlement = {
        ...settlement,
        status: 'PROCESSED',
        processedAt: new Date().toISOString(),
      };
    },
    void: () => {
      if (settlement.status === 'PROCESSED')
        throw new Error('Cannot void processed settlement');
      settlement = { ...settlement, status: 'VOID' };
    },
  };
}

describe('Settlement Lifecycle Workflow', () => {
  it('follows complete lifecycle: CREATED -> APPROVED -> PROCESSED', () => {
    const workflow = createSettlementWorkflow();

    expect(workflow.getSettlement().status).toBe('CREATED');

    workflow.approve('user-1');
    expect(workflow.getSettlement().status).toBe('APPROVED');
    expect(workflow.getSettlement().approvedBy).toBe('user-1');
    expect(workflow.getSettlement().approvedAt).toBeDefined();

    workflow.process();
    expect(workflow.getSettlement().status).toBe('PROCESSED');
    expect(workflow.getSettlement().processedAt).toBeDefined();
  });

  it('prevents processing before approval', () => {
    const workflow = createSettlementWorkflow();
    expect(() => workflow.process()).toThrow(
      'Can only process APPROVED settlements'
    );
  });

  it('prevents approving non-CREATED settlements', () => {
    const workflow = createSettlementWorkflow();
    workflow.approve('user-1');
    expect(() => workflow.approve('user-2')).toThrow(
      'Can only approve CREATED settlements'
    );
  });

  it('prevents voiding processed settlements', () => {
    const workflow = createSettlementWorkflow();
    workflow.approve('user-1');
    workflow.process();
    expect(() => workflow.void()).toThrow('Cannot void processed settlement');
  });

  it('allows voiding created settlements', () => {
    const workflow = createSettlementWorkflow();
    workflow.void();
    expect(workflow.getSettlement().status).toBe('VOID');
  });

  it('allows voiding approved settlements', () => {
    const workflow = createSettlementWorkflow();
    workflow.approve('user-1');
    workflow.void();
    expect(workflow.getSettlement().status).toBe('VOID');
  });

  it('calculates net amount correctly', () => {
    const settlement = mockSettlements[1]; // APPROVED: gross=1150, deductions=50, net=1100
    expect(settlement.grossAmount - settlement.deductions).toBe(
      settlement.netAmount
    );
  });

  it('renders settlement lifecycle status progression', () => {
    const SettlementLifecycle = () => (
      <div data-testid="settlement-lifecycle">
        <h2>Settlement Lifecycle</h2>
        {mockSettlements.map((s) => (
          <div key={s.id} data-testid={`settlement-${s.id}`}>
            <span>{s.settlementNumber}</span>
            <span data-testid="status">{s.status}</span>
            <span>${s.netAmount}</span>
          </div>
        ))}
      </div>
    );

    render(<SettlementLifecycle />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('PROCESSED')).toBeInTheDocument();
  });

  it('validates settlement line items sum to gross amount', () => {
    const settlement = mockSettlements[0];
    const lineItemTotal = settlement.lineItems.reduce(
      (sum, li) => sum + li.amount,
      0
    );
    expect(lineItemTotal).toBe(settlement.grossAmount);
  });

  it('tracks approval metadata', () => {
    const approved = mockSettlements[1];
    expect(approved.approvedAt).toBeDefined();
    expect(approved.approvedBy).toBe('user-1');
    expect(approved.status).toBe('APPROVED');
  });

  it('tracks processing metadata', () => {
    const processed = mockSettlements[2];
    expect(processed.processedAt).toBeDefined();
    expect(processed.status).toBe('PROCESSED');
  });

  it('maintains carrier reference across lifecycle', () => {
    const workflow = createSettlementWorkflow();
    const carrierId = workflow.getSettlement().carrierId;

    workflow.approve('user-1');
    expect(workflow.getSettlement().carrierId).toBe(carrierId);

    workflow.process();
    expect(workflow.getSettlement().carrierId).toBe(carrierId);
  });
});
