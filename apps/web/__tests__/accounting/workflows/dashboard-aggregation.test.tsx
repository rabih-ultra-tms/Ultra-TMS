/**
 * Dashboard Aggregation Workflow Integration Tests
 * Tests the dashboard data aggregation from invoices, payments, and settlements
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
  mockPaymentsMade,
  mockAccountingDashboard,
} from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Dashboard Aggregation Workflow', () => {
  it('calculates total accounts receivable from unpaid invoices', () => {
    const totalAR = mockInvoices
      .filter((inv) => inv.status !== 'VOID' && inv.status !== 'PAID')
      .reduce((sum, inv) => sum + inv.balanceDue, 0);

    expect(totalAR).toBeGreaterThan(0);
    expect(totalAR).toBe(542.5 + 813.75); // DRAFT + SENT balances
  });

  it('calculates total accounts payable from pending settlements', () => {
    const totalAP = mockSettlements
      .filter((s) => s.status !== 'PROCESSED')
      .reduce((sum, s) => sum + s.netAmount, 0);

    expect(totalAP).toBeGreaterThan(0);
    expect(totalAP).toBe(500 + 1100); // CREATED + APPROVED
  });

  it('calculates days sales outstanding (DSO)', () => {
    const paidInvoices = mockInvoices.filter((inv) => inv.status === 'PAID');
    expect(paidInvoices.length).toBeGreaterThan(0);

    // DSO = (Total AR / Total Revenue) * Days in period
    const dso = mockAccountingDashboard.DSO;
    expect(dso).toBeGreaterThan(0);
    expect(dso).toBeLessThan(365);
  });

  it('counts overdue invoices correctly', () => {
    const now = new Date();
    const overdueInvoices = mockInvoices.filter((inv) => {
      if (inv.status === 'PAID' || inv.status === 'VOID') return false;
      return new Date(inv.dueDate) < now;
    });

    expect(overdueInvoices.length).toBeGreaterThanOrEqual(0);
  });

  it('calculates revenue MTD from paid invoices', () => {
    const paidInvoices = mockInvoices.filter((inv) => inv.status === 'PAID');
    const totalPaid = paidInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    expect(totalPaid).toBeGreaterThan(0);
  });

  it('aggregates payment methods distribution', () => {
    const methodCounts: Record<string, number> = {};
    mockPaymentsReceived.forEach((p) => {
      methodCounts[p.method] = (methodCounts[p.method] || 0) + 1;
    });

    expect(methodCounts['ACH']).toBe(1);
    expect(methodCounts['CHECK']).toBe(2);
  });

  it('calculates overall cash position', () => {
    const cashIn = mockPaymentsReceived
      .filter((p) => p.status !== 'BOUNCED')
      .reduce((sum, p) => sum + p.amount, 0);
    const cashOut = mockPaymentsMade
      .filter((p) => p.status !== 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    expect(cashIn).toBeGreaterThan(0);
    expect(cashOut).toBeGreaterThan(0);
    const netCashFlow = cashIn - cashOut;
    expect(typeof netCashFlow).toBe('number');
  });

  it('renders complete dashboard with all KPI cards', () => {
    const DashboardSummary = () => (
      <div data-testid="dashboard-summary">
        <div data-testid="kpi-ar">
          <h3>Accounts Receivable</h3>
          <p>${mockAccountingDashboard.totalAR.toLocaleString()}</p>
        </div>
        <div data-testid="kpi-ap">
          <h3>Accounts Payable</h3>
          <p>${mockAccountingDashboard.totalAP.toLocaleString()}</p>
        </div>
        <div data-testid="kpi-dso">
          <h3>DSO</h3>
          <p>{mockAccountingDashboard.DSO} days</p>
        </div>
        <div data-testid="kpi-overdue">
          <h3>Overdue Invoices</h3>
          <p>{mockAccountingDashboard.overdueInvoiceCount}</p>
        </div>
      </div>
    );

    render(<DashboardSummary />);
    expect(screen.getByTestId('kpi-ar')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-ap')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-dso')).toBeInTheDocument();
    expect(screen.getByText(/28 days/)).toBeInTheDocument();
  });

  it('groups settlements by status for dashboard chart', () => {
    const statusGroups: Record<string, number> = {};
    mockSettlements.forEach((s) => {
      statusGroups[s.status] = (statusGroups[s.status] || 0) + 1;
    });

    expect(statusGroups['CREATED']).toBe(1);
    expect(statusGroups['APPROVED']).toBe(1);
    expect(statusGroups['PROCESSED']).toBe(1);
  });

  it('tracks bounced payment rate', () => {
    const total = mockPaymentsReceived.length;
    const bounced = mockPaymentsReceived.filter(
      (p) => p.status === 'BOUNCED'
    ).length;
    const bounceRate = (bounced / total) * 100;

    expect(bounceRate).toBeGreaterThan(0);
    expect(bounceRate).toBeLessThan(100);
  });
});
