/* eslint-disable no-undef */
import { getJournalEntryColumns } from './journal-entries-table';

describe('Journal Entries Table Columns', () => {
  it('returns columns with correct structure', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes entry number column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'entryNumber',
      })
    );
  });

  it('includes date column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'date',
      })
    );
  });

  it('includes reference column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'referenceType',
      })
    );
  });

  it('includes status column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'status',
      })
    );
  });

  it('includes debit column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'totalDebit',
      })
    );
  });

  it('includes credit column', () => {
    const columns = getJournalEntryColumns();
    expect(columns).toContainEqual(
      expect.objectContaining({
        accessorKey: 'totalCredit',
      })
    );
  });
});
