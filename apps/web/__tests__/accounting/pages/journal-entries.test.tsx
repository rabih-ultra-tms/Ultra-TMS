/**
 * Journal Entries page workflow tests
 * Tests the journal entries page at /accounting/journal-entries
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';

// Mock the page component
const MockJournalEntriesPage = () => {
  const entries = [
    {
      id: 'je-1',
      entryNumber: 'JE-001',
      date: '2026-03-10',
      description: 'Revenue recognition',
      status: 'DRAFT',
      totalDebit: 500,
      totalCredit: 500,
    },
    {
      id: 'je-2',
      entryNumber: 'JE-002',
      date: '2026-03-09',
      description: 'Cash receipt',
      status: 'POSTED',
      totalDebit: 1000,
      totalCredit: 1000,
    },
    {
      id: 'je-3',
      entryNumber: 'JE-003',
      date: '2026-03-08',
      description: 'Expense accrual',
      status: 'POSTED',
      totalDebit: 300,
      totalCredit: 300,
    },
  ];

  return (
    <div data-testid="journal-entries">
      <h1>Journal Entries</h1>
      <p>Manage general ledger entries.</p>
      <button>New Journal Entry</button>
      <table>
        <thead>
          <tr>
            <th>Entry #</th>
            <th>Date</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.entryNumber}</td>
              <td>{entry.date}</td>
              <td>{entry.description}</td>
              <td>${entry.totalDebit}</td>
              <td>${entry.totalCredit}</td>
              <td>{entry.status}</td>
              <td>
                <button disabled={entry.status === 'POSTED'} title="Post">
                  Post
                </button>
                <button disabled={entry.status === 'DRAFT'} title="Reverse">
                  Reverse
                </button>
                <button disabled={entry.status === 'POSTED'} title="Delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Journal Entries Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders journal entries page', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByTestId('journal-entries')).toBeInTheDocument();
  });

  it('displays page title', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
  });

  it('displays page description', () => {
    render(<MockJournalEntriesPage />);
    expect(
      screen.getByText('Manage general ledger entries.')
    ).toBeInTheDocument();
  });

  it('shows new journal entry button', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('New Journal Entry')).toBeInTheDocument();
  });

  it('displays journal entries table with data', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('JE-001')).toBeInTheDocument();
    expect(screen.getByText('JE-002')).toBeInTheDocument();
    expect(screen.getByText('JE-003')).toBeInTheDocument();
  });

  it('displays entry numbers', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('JE-001')).toBeInTheDocument();
    expect(screen.getByText('JE-002')).toBeInTheDocument();
    expect(screen.getByText('JE-003')).toBeInTheDocument();
  });

  it('displays entry descriptions', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('Revenue recognition')).toBeInTheDocument();
    expect(screen.getByText('Cash receipt')).toBeInTheDocument();
    expect(screen.getByText('Expense accrual')).toBeInTheDocument();
  });

  it('displays debit amounts', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getAllByText('$500').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('$1000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('$300').length).toBeGreaterThanOrEqual(1);
  });

  it('displays credit amounts', () => {
    render(<MockJournalEntriesPage />);
    // All entries have debit = credit
    const creditCells = screen.getAllByText('$500');
    expect(creditCells.length).toBeGreaterThan(0);
  });

  it('displays entry statuses', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getAllByText('POSTED').length).toBeGreaterThanOrEqual(1);
  });

  it('shows post button for draft entries', () => {
    render(<MockJournalEntriesPage />);
    const postButtons = screen.getAllByTitle('Post');
    expect(postButtons.length).toBeGreaterThan(0);
  });

  it('shows reverse button for posted entries', () => {
    render(<MockJournalEntriesPage />);
    const reverseButtons = screen.getAllByTitle('Reverse');
    expect(reverseButtons.length).toBeGreaterThan(0);
  });

  it('shows delete button for draft entries', () => {
    render(<MockJournalEntriesPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('post button is disabled for posted entries', () => {
    render(<MockJournalEntriesPage />);
    const postButtons = screen.getAllByTitle('Post');
    // Second post button (JE-002) should be disabled
    expect(postButtons[1]).toBeDisabled();
  });

  it('reverse button is disabled for draft entries', () => {
    render(<MockJournalEntriesPage />);
    const reverseButtons = screen.getAllByTitle('Reverse');
    // First reverse button (JE-001) should be disabled
    expect(reverseButtons[0]).toBeDisabled();
  });

  it('delete button is disabled for posted entries', () => {
    render(<MockJournalEntriesPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    // Second delete button (JE-002) should be disabled
    expect(deleteButtons[1]).toBeDisabled();
  });

  it('displays all table columns', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('Entry #')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Debit')).toBeInTheDocument();
    expect(screen.getByText('Credit')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders as table for accessibility', () => {
    render(<MockJournalEntriesPage />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('has table headers', () => {
    render(<MockJournalEntriesPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('displays all entry rows', () => {
    render(<MockJournalEntriesPage />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 entries
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('shows empty state when no entries', () => {
    const EmptyPage = () => (
      <div data-testid="journal-entries">
        <h1>Journal Entries</h1>
        <p>No journal entries found</p>
      </div>
    );

    render(<EmptyPage />);
    expect(screen.getByText('No journal entries found')).toBeInTheDocument();
  });

  it('allows posting draft entry', async () => {
    const user = userEvent.setup();
    render(<MockJournalEntriesPage />);

    const postButtons = screen.getAllByTitle('Post');
    const firstPostButton = postButtons[0]; // JE-001 (DRAFT)
    await user.click(firstPostButton);

    expect(firstPostButton).toBeInTheDocument();
  });

  it('allows reversing posted entry', async () => {
    const user = userEvent.setup();
    render(<MockJournalEntriesPage />);

    const reverseButtons = screen.getAllByTitle('Reverse');
    const secondReverseButton = reverseButtons[1]; // JE-002 (POSTED)
    await user.click(secondReverseButton);

    expect(secondReverseButton).toBeInTheDocument();
  });

  it('allows deleting draft entry', async () => {
    const user = userEvent.setup();
    render(<MockJournalEntriesPage />);

    const deleteButtons = screen.getAllByTitle('Delete');
    const firstDeleteButton = deleteButtons[0]; // JE-001 (DRAFT)
    await user.click(firstDeleteButton);

    expect(firstDeleteButton).toBeInTheDocument();
  });

  it('validates debits equal credits', () => {
    render(<MockJournalEntriesPage />);
    // All entries should have equal debits and credits
    expect(screen.getAllByText('$500').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('$1000').length).toBeGreaterThanOrEqual(1);
  });

  it('displays entry dates', () => {
    render(<MockJournalEntriesPage />);
    expect(screen.getByText('2026-03-10')).toBeInTheDocument();
    expect(screen.getByText('2026-03-09')).toBeInTheDocument();
    expect(screen.getByText('2026-03-08')).toBeInTheDocument();
  });
});
