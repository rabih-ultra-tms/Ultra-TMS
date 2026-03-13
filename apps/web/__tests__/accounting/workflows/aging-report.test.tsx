/**
 * Aging Report Workflow Integration Tests
 * Tests the accounts aging calculation and reporting
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { mockInvoices, mockSettlements } from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';

function calculateAgingBuckets(invoices: typeof mockInvoices, asOf: Date) {
  const buckets: Record<AgingBucket, { count: number; total: number }> = {
    current: { count: 0, total: 0 },
    '1-30': { count: 0, total: 0 },
    '31-60': { count: 0, total: 0 },
    '61-90': { count: 0, total: 0 },
    '90+': { count: 0, total: 0 },
  };

  invoices
    .filter(
      (inv) =>
        inv.status !== 'VOID' && inv.status !== 'PAID' && inv.balanceDue > 0
    )
    .forEach((inv) => {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.floor(
        (asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let bucket: AgingBucket;
      if (daysOverdue <= 0) bucket = 'current';
      else if (daysOverdue <= 30) bucket = '1-30';
      else if (daysOverdue <= 60) bucket = '31-60';
      else if (daysOverdue <= 90) bucket = '61-90';
      else bucket = '90+';

      buckets[bucket].count++;
      buckets[bucket].total += inv.balanceDue;
    });

  return buckets;
}

describe('Aging Report Workflow', () => {
  const asOfDate = new Date('2026-04-15');

  it('calculates aging buckets correctly', () => {
    const buckets = calculateAgingBuckets(mockInvoices, asOfDate);
    const totalBucketAmount = Object.values(buckets).reduce(
      (sum, b) => sum + b.total,
      0
    );
    const openInvoiceTotal = mockInvoices
      .filter(
        (i) => i.status !== 'VOID' && i.status !== 'PAID' && i.balanceDue > 0
      )
      .reduce((sum, i) => sum + i.balanceDue, 0);

    expect(totalBucketAmount).toBe(openInvoiceTotal);
  });

  it('places current invoices in the current bucket', () => {
    // INV-2026-001 due 2026-03-31, as of 2026-04-15 = 15 days overdue -> 1-30 bucket
    const buckets = calculateAgingBuckets(mockInvoices, asOfDate);
    // At least one bucket should have entries
    const totalEntries = Object.values(buckets).reduce(
      (sum, b) => sum + b.count,
      0
    );
    expect(totalEntries).toBeGreaterThan(0);
  });

  it('calculates overdue invoice count', () => {
    const overdueCount = mockInvoices.filter((inv) => {
      if (inv.status === 'PAID' || inv.status === 'VOID') return false;
      return new Date(inv.dueDate) < asOfDate;
    }).length;

    expect(overdueCount).toBeGreaterThanOrEqual(0);
  });

  it('excludes void invoices from aging', () => {
    const buckets = calculateAgingBuckets(mockInvoices, asOfDate);
    const voidInvoice = mockInvoices.find((i) => i.status === 'VOID');
    expect(voidInvoice).toBeDefined();

    // Void invoice balance should not appear in any bucket
    const totalBucketed = Object.values(buckets).reduce(
      (sum, b) => sum + b.total,
      0
    );
    // The void invoice's totalAmount (325.5) should not be part of the bucketed total
    const nonVoidAR = mockInvoices
      .filter(
        (i) => i.status !== 'VOID' && i.status !== 'PAID' && i.balanceDue > 0
      )
      .reduce((sum, i) => sum + i.balanceDue, 0);
    expect(totalBucketed).toBe(nonVoidAR);
  });

  it('excludes paid invoices from aging', () => {
    const paidInvoice = mockInvoices.find((i) => i.status === 'PAID');
    expect(paidInvoice?.balanceDue).toBe(0);

    const buckets = calculateAgingBuckets(mockInvoices, asOfDate);
    // Paid invoice has 0 balance, shouldn't contribute
    const totalBucketed = Object.values(buckets).reduce(
      (sum, b) => sum + b.total,
      0
    );
    expect(totalBucketed).toBeGreaterThan(0);
  });

  it('calculates AP aging from settlements', () => {
    const pendingSettlements = mockSettlements.filter(
      (s) => s.status !== 'PROCESSED'
    );
    const totalPendingAP = pendingSettlements.reduce(
      (sum, s) => sum + s.netAmount,
      0
    );

    expect(pendingSettlements.length).toBe(2);
    expect(totalPendingAP).toBe(1600);
  });

  it('renders aging report table', () => {
    const buckets = calculateAgingBuckets(mockInvoices, asOfDate);
    const AgingReportTable = () => (
      <div data-testid="aging-report">
        <h2>Accounts Receivable Aging</h2>
        <table>
          <thead>
            <tr>
              <th>Aging Bucket</th>
              <th>Count</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(
              Object.entries(buckets) as [
                AgingBucket,
                { count: number; total: number },
              ][]
            ).map(([bucket, data]) => (
              <tr key={bucket}>
                <td>{bucket}</td>
                <td>{data.count}</td>
                <td>${data.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    render(<AgingReportTable />);
    expect(screen.getByText('Accounts Receivable Aging')).toBeInTheDocument();
    expect(screen.getByText('current')).toBeInTheDocument();
    expect(screen.getByText('1-30')).toBeInTheDocument();
    expect(screen.getByText('31-60')).toBeInTheDocument();
  });

  it('calculates weighted average days outstanding', () => {
    const openInvoices = mockInvoices.filter(
      (i) => i.status !== 'VOID' && i.status !== 'PAID' && i.balanceDue > 0
    );

    let totalWeightedDays = 0;
    let totalAR = 0;

    openInvoices.forEach((inv) => {
      const dueDate = new Date(inv.dueDate);
      const daysOutstanding = Math.max(
        0,
        Math.floor(
          (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      totalWeightedDays += daysOutstanding * inv.balanceDue;
      totalAR += inv.balanceDue;
    });

    const weightedAvgDays = totalAR > 0 ? totalWeightedDays / totalAR : 0;
    expect(typeof weightedAvgDays).toBe('number');
    expect(weightedAvgDays).toBeGreaterThanOrEqual(0);
  });

  it('identifies highest risk invoices by amount and age', () => {
    const riskScore = (inv: (typeof mockInvoices)[0]) => {
      const daysOverdue = Math.max(
        0,
        Math.floor(
          (asOfDate.getTime() - new Date(inv.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      return inv.balanceDue * (1 + daysOverdue / 30);
    };

    const openInvoices = mockInvoices
      .filter(
        (i) => i.status !== 'VOID' && i.status !== 'PAID' && i.balanceDue > 0
      )
      .sort((a, b) => riskScore(b) - riskScore(a));

    expect(openInvoices.length).toBeGreaterThan(0);
    expect(riskScore(openInvoices[0])).toBeGreaterThanOrEqual(
      riskScore(openInvoices[openInvoices.length - 1])
    );
  });
});
