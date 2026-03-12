/* eslint-disable no-undef */
import { getPaymentColumns } from './payments-table';

interface PaymentColumnActions {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

describe('Payments Table Columns', () => {
  const mockActions: PaymentColumnActions = {
    onView: () => {},
    onDelete: () => {},
  };

  it('returns columns with correct structure', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes payment number column', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'paymentNumber',
      })
    );
  });

  it('includes amount column', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'amount',
      })
    );
  });

  it('includes status column', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'status',
      })
    );
  });

  it('includes method column', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'method',
      })
    );
  });

  it('includes paymentDate column', () => {
    const columns = getPaymentColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'paymentDate',
      })
    );
  });

  it('includes actions column', () => {
    const columns = getPaymentColumns(mockActions);
    const actionsColumn = columns.find(
      (col) => 'id' in col && col.id === 'actions'
    );
    expect(actionsColumn).toBeDefined();
  });
});
