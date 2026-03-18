 
import { getPayableColumns } from './payables-table';

interface PayableColumnActions {
  onView: (id: string) => void;
}

describe('Payables Table Columns', () => {
  const mockActions: PayableColumnActions = {
    onView: () => {},
  };

  it('returns columns with correct structure', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes carrier name column', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'carrierName',
      })
    );
  });

  it('includes load number column', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'loadNumber',
      })
    );
  });

  it('includes status column', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'status',
      })
    );
  });

  it('includes amount column', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'amount',
      })
    );
  });

  it('includes paymentDueDate column', () => {
    const columns = getPayableColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'paymentDueDate',
      })
    );
  });

  it('includes actions column', () => {
    const columns = getPayableColumns(mockActions);
    const actionsColumn = columns.find(
      (col) => 'id' in col && col.id === 'actions'
    );
    expect(actionsColumn).toBeDefined();
  });
});
