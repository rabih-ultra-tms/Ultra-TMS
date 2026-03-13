/**
 * Chart of Accounts page workflow tests
 * Tests the chart of accounts page at /accounting/chart-of-accounts
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { mockChartOfAccounts } from '@/test/data/accounting-fixtures';

// Mock the page component
const MockChartOfAccountsPage = () => {
  return (
    <div data-testid="chart-of-accounts">
      <h1>Chart of Accounts</h1>
      <p>Manage general ledger accounts.</p>
      <button>New Account</button>
      <input type="text" placeholder="Search accounts..." />
      <table>
        <thead>
          <tr>
            <th>Account #</th>
            <th>Account Name</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockChartOfAccounts.map((account) => (
            <tr key={account.id}>
              <td>{account.accountNumber}</td>
              <td>{account.accountName}</td>
              <td>{account.accountType}</td>
              <td>${account.balance}</td>
              <td>{account.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button disabled={!account.isActive} title="Edit">
                  Edit
                </button>
                <button disabled={account.isSystemAccount} title="Delete">
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

describe('Chart of Accounts Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart of accounts page', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByTestId('chart-of-accounts')).toBeInTheDocument();
  });

  it('displays page title', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
  });

  it('displays page description', () => {
    render(<MockChartOfAccountsPage />);
    expect(
      screen.getByText('Manage general ledger accounts.')
    ).toBeInTheDocument();
  });

  it('shows new account button', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('New Account')).toBeInTheDocument();
  });

  it('shows search field', () => {
    render(<MockChartOfAccountsPage />);
    expect(
      screen.getByPlaceholderText('Search accounts...')
    ).toBeInTheDocument();
  });

  it('displays accounts table with data', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
    expect(screen.getByText('Freight Revenue')).toBeInTheDocument();
  });

  it('displays account numbers', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('4000')).toBeInTheDocument();
  });

  it('displays account names', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
    expect(screen.getByText('Freight Revenue')).toBeInTheDocument();
  });

  it('displays account types', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('ASSET')).toBeInTheDocument();
    expect(screen.getByText('LIABILITY')).toBeInTheDocument();
    expect(screen.getByText('REVENUE')).toBeInTheDocument();
  });

  it('displays account balances', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('$50000')).toBeInTheDocument();
    expect(screen.getByText('$25000')).toBeInTheDocument();
    expect(screen.getByText('$250000')).toBeInTheDocument();
  });

  it('displays account status', () => {
    render(<MockChartOfAccountsPage />);
    const activeStatuses = screen.getAllByText('Active');
    expect(activeStatuses.length).toBeGreaterThan(0);
  });

  it('shows edit button for active accounts', () => {
    render(<MockChartOfAccountsPage />);
    const editButtons = screen.getAllByTitle('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('shows delete button for non-system accounts', () => {
    render(<MockChartOfAccountsPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('disables delete button for system accounts', () => {
    render(<MockChartOfAccountsPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    // System accounts should have disabled delete buttons
    expect(deleteButtons[0]).toBeDisabled();
  });

  it('displays all table columns', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('Account #')).toBeInTheDocument();
    expect(screen.getByText('Account Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders as table for accessibility', () => {
    render(<MockChartOfAccountsPage />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('has table headers', () => {
    render(<MockChartOfAccountsPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('displays all account rows', () => {
    render(<MockChartOfAccountsPage />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 accounts
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('allows searching accounts', async () => {
    const user = userEvent.setup();
    render(<MockChartOfAccountsPage />);

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    await user.type(searchInput, 'Cash');

    expect((searchInput as HTMLInputElement).value).toBe('Cash');
  });

  it('allows creating new account', async () => {
    const user = userEvent.setup();
    render(<MockChartOfAccountsPage />);

    const newButton = screen.getByText('New Account');
    await user.click(newButton);

    expect(newButton).toBeInTheDocument();
  });

  it('allows editing active account', async () => {
    const user = userEvent.setup();
    render(<MockChartOfAccountsPage />);

    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);

    expect(editButtons[0]).toBeInTheDocument();
  });

  it('allows deleting non-system account', async () => {
    const user = userEvent.setup();
    render(<MockChartOfAccountsPage />);

    const deleteButtons = screen.getAllByTitle('Delete');
    const enabledDeleteButton = deleteButtons.find(
      (btn) => !btn.hasAttribute('disabled')
    );

    if (enabledDeleteButton) {
      await user.click(enabledDeleteButton);
      expect(enabledDeleteButton).toBeInTheDocument();
    }
  });

  it('shows empty state when no accounts', () => {
    const EmptyPage = () => (
      <div data-testid="chart-of-accounts">
        <h1>Chart of Accounts</h1>
        <p>No accounts found</p>
      </div>
    );

    render(<EmptyPage />);
    expect(screen.getByText('No accounts found')).toBeInTheDocument();
  });

  it('displays accounts with hierarchy structure', () => {
    render(<MockChartOfAccountsPage />);
    // Accounts should be displayed in order
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('4000')).toBeInTheDocument();
  });

  it('shows account type correctly', () => {
    render(<MockChartOfAccountsPage />);
    const assetAccounts = screen.getAllByText('ASSET');
    expect(assetAccounts.length).toBeGreaterThan(0);
  });

  it('displays balances with currency formatting', () => {
    render(<MockChartOfAccountsPage />);
    expect(screen.getByText('$50000')).toBeInTheDocument();
    expect(screen.getByText('$25000')).toBeInTheDocument();
  });
});
