 
import { getChartOfAccountsColumns } from './chart-of-accounts-table';
import type { ChartOfAccount } from '@/lib/hooks/accounting/use-chart-of-accounts';

interface AccountColumnActions {
  onEdit: (account: ChartOfAccount) => void;
  onDelete: (account: ChartOfAccount) => void;
}

describe('Chart of Accounts Table Columns', () => {
  const mockActions: AccountColumnActions = {
    onEdit: () => {},
    onDelete: () => {},
  };

  it('returns columns with correct structure', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes account number column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'accountNumber',
      })
    );
  });

  it('includes account name column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'accountName',
      })
    );
  });

  it('includes account type column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'accountType',
      })
    );
  });

  it('includes normal balance column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'normalBalance',
      })
    );
  });

  it('includes balance column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'balance',
      })
    );
  });

  it('includes actions column', () => {
    const columns = getChartOfAccountsColumns(mockActions);
    const actionsColumn = columns.find(
      (col) => 'id' in col && col.id === 'actions'
    );
    expect(actionsColumn).toBeDefined();
  });
});
