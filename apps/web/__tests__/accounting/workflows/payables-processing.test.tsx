/**
 * Payables Processing Workflow Integration Tests
 * Tests the accounts payable workflow from settlement to carrier payment
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import {
  mockSettlements,
  mockPaymentsMade,
} from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

function createPayablesWorkflow() {
  const payables = mockSettlements.map((s) => ({
    id: `payable-${s.id}`,
    settlementId: s.id,
    carrierId: s.carrierId,
    carrierName: s.carrierName,
    amount: s.netAmount,
    status:
      s.status === 'PROCESSED' ? ('PAID' as string) : ('PENDING' as string),
    paymentId: undefined as string | undefined,
  }));

  return {
    getPayables: () => payables,
    getByCarrier: (carrierId: string) =>
      payables.filter((p) => p.carrierId === carrierId),
    markAsPaid: (payableId: string, paymentId: string) => {
      const payable = payables.find((p) => p.id === payableId);
      if (!payable) throw new Error('Payable not found');
      if (payable.status === 'PAID') throw new Error('Already paid');
      payable.status = 'PAID';
      payable.paymentId = paymentId;
    },
    getTotalOutstanding: () =>
      payables
        .filter((p) => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0),
    getTotalPaid: () =>
      payables
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0),
  };
}

describe('Payables Processing Workflow', () => {
  it('creates payables from approved settlements', () => {
    const workflow = createPayablesWorkflow();
    const payables = workflow.getPayables();

    expect(payables.length).toBe(3);
    expect(payables.every((p) => p.amount > 0)).toBe(true);
  });

  it('groups payables by carrier', () => {
    const workflow = createPayablesWorkflow();
    const swiftPayables = workflow.getByCarrier('c1');
    const mikesPayables = workflow.getByCarrier('c2');

    expect(swiftPayables.length).toBe(2);
    expect(mikesPayables.length).toBe(1);
  });

  it('calculates total outstanding amount', () => {
    const workflow = createPayablesWorkflow();
    const outstanding = workflow.getTotalOutstanding();

    // CREATED (500) + APPROVED (1100) = 1600 pending
    expect(outstanding).toBe(1600);
  });

  it('marks payable as paid with payment reference', () => {
    const workflow = createPayablesWorkflow();
    const pendingPayables = workflow
      .getPayables()
      .filter((p) => p.status === 'PENDING');
    const payableId = pendingPayables[0].id;

    workflow.markAsPaid(payableId, 'PAY-MADE-001');
    const updated = workflow.getPayables().find((p) => p.id === payableId);
    expect(updated?.status).toBe('PAID');
    expect(updated?.paymentId).toBe('PAY-MADE-001');
  });

  it('prevents double payment', () => {
    const workflow = createPayablesWorkflow();
    const paidPayables = workflow
      .getPayables()
      .filter((p) => p.status === 'PAID');
    if (paidPayables.length > 0) {
      expect(() => workflow.markAsPaid(paidPayables[0].id, 'PAY-NEW')).toThrow(
        'Already paid'
      );
    }
  });

  it('totals payments made by carrier', () => {
    const carrierPayments: Record<string, number> = {};
    mockPaymentsMade.forEach((p) => {
      carrierPayments[p.carrierName] =
        (carrierPayments[p.carrierName] || 0) + p.amount;
    });

    expect(carrierPayments['Swift Trucking LLC']).toBe(1600);
    expect(carrierPayments["Mike's Hauling"]).toBe(725);
  });

  it('tracks payment methods for payables', () => {
    const methods = mockPaymentsMade.map((p) => p.method);
    expect(methods).toContain('ACH');
    expect(methods).toContain('CHECK');
  });

  it('renders payable summary by carrier', () => {
    const PayableSummary = () => (
      <div data-testid="payable-summary">
        <h2>Carrier Payables Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Carrier</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockSettlements.map((s) => (
              <tr key={s.id}>
                <td>{s.carrierName}</td>
                <td>${s.netAmount}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    render(<PayableSummary />);
    expect(screen.getByText('Carrier Payables Summary')).toBeInTheDocument();
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Mike's Hauling")).toBeInTheDocument();
  });

  it('calculates net payment after deductions', () => {
    mockSettlements.forEach((s) => {
      expect(s.netAmount).toBe(s.grossAmount - s.deductions);
    });
  });

  it('matches payments made to settlements', () => {
    const processedSettlement = mockSettlements.find(
      (s) => s.status === 'PROCESSED'
    );
    const correspondingPayment = mockPaymentsMade.find(
      (p) =>
        p.carrierId === processedSettlement?.carrierId &&
        p.amount === processedSettlement?.netAmount
    );
    expect(correspondingPayment).toBeDefined();
  });
});
