 
import { getSettlementColumns } from './settlement-table';

interface SettlementColumnActions {
  onView: (id: string) => void;
}

describe('Settlement Table Columns', () => {
  const mockActions: SettlementColumnActions = {
    onView: () => {},
  };

  it('returns columns with correct structure', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes settlement number column', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'settlementNumber',
      })
    );
  });

  it('includes carrier name column', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'carrierName',
      })
    );
  });

  it('includes status column', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'status',
      })
    );
  });

  it('includes grossAmount column', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'grossAmount',
      })
    );
  });

  it('includes netAmount column', () => {
    const columns = getSettlementColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'netAmount',
      })
    );
  });

  it('includes actions column', () => {
    const columns = getSettlementColumns(mockActions);
    const actionsColumn = columns.find(
      (col) => 'id' in col && col.id === 'actions'
    );
    expect(actionsColumn).toBeDefined();
  });
});
