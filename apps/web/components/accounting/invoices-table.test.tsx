 
import { getInvoiceColumns } from './invoices-table';

interface InvoiceColumnActions {
  onSend: (id: string) => void;
  onVoid: (id: string) => void;
  onDownloadPdf: (id: string) => void;
}

describe('Invoice Table Columns', () => {
  const mockActions: InvoiceColumnActions = {
    onSend: () => {},
    onVoid: () => {},
    onDownloadPdf: () => {},
  };

  it('returns columns with correct structure', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes invoice number column', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'invoiceNumber',
      })
    );
  });

  it('includes customer name column', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'customerName',
      })
    );
  });

  it('includes status column', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'status',
      })
    );
  });

  it('includes totalAmount column', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'totalAmount',
      })
    );
  });

  it('includes balanceDue column', () => {
    const columns = getInvoiceColumns(mockActions);
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'balanceDue',
      })
    );
  });

  it('includes actions column', () => {
    const columns = getInvoiceColumns(mockActions);
    const actionsColumn = columns.find(
      (col) => 'id' in col && col.id === 'actions'
    );
    expect(actionsColumn).toBeDefined();
  });
});
