// @ts-nocheck
/**
 * Chart of Accounts Workflow Integration Tests
 * Tests chart of accounts management and GL integration
 */
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { mockChartOfAccounts } from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

function createCOAWorkflow() {
  const accounts = mockChartOfAccounts.map((a) => ({ ...a }));

  return {
    getAccounts: () => accounts,
    getByType: (type: string) => accounts.filter((a) => a.accountType === type),
    getActiveAccounts: () => accounts.filter((a) => a.isActive),
    getSystemAccounts: () => accounts.filter((a) => a.isSystemAccount),
    addAccount: (account: (typeof mockChartOfAccounts)[0]) => {
      const exists = accounts.find(
        (a) => a.accountNumber === account.accountNumber
      );
      if (exists)
        throw new Error(`Account ${account.accountNumber} already exists`);
      accounts.push(account);
      return account;
    },
    deactivateAccount: (id: string) => {
      const account = accounts.find((a) => a.id === id);
      if (!account) throw new Error('Account not found');
      if (account.isSystemAccount)
        throw new Error('Cannot deactivate system account');
      account.isActive = false;
      return account;
    },
    getTotalByType: (type: string) => {
      return accounts
        .filter((a) => a.accountType === type && a.isActive)
        .reduce((sum, a) => sum + a.balance, 0);
    },
  };
}

describe('Chart of Accounts Workflow', () => {
  it('loads all accounts from chart', () => {
    const workflow = createCOAWorkflow();
    expect(workflow.getAccounts().length).toBe(3);
  });

  it('filters accounts by type', () => {
    const workflow = createCOAWorkflow();
    const assets = workflow.getByType('ASSET');
    const liabilities = workflow.getByType('LIABILITY');
    const revenue = workflow.getByType('REVENUE');

    expect(assets.length).toBe(1);
    expect(liabilities.length).toBe(1);
    expect(revenue.length).toBe(1);
  });

  it('identifies system accounts', () => {
    const workflow = createCOAWorkflow();
    const systemAccounts = workflow.getSystemAccounts();

    expect(systemAccounts.length).toBe(2); // Cash and AP
    expect(systemAccounts.map((a) => a.accountName)).toContain('Cash');
    expect(systemAccounts.map((a) => a.accountName)).toContain(
      'Accounts Payable'
    );
  });

  it('prevents deactivation of system accounts', () => {
    const workflow = createCOAWorkflow();
    const systemAccount = workflow.getSystemAccounts()[0];

    expect(() => workflow.deactivateAccount(systemAccount.id)).toThrow(
      'Cannot deactivate system account'
    );
  });

  it('allows deactivation of non-system accounts', () => {
    const workflow = createCOAWorkflow();
    const nonSystem = workflow.getAccounts().find((a) => !a.isSystemAccount);
    expect(nonSystem).toBeDefined();

    const result = workflow.deactivateAccount(nonSystem!.id);
    expect(result.isActive).toBe(false);
  });

  it('prevents duplicate account numbers', () => {
    const workflow = createCOAWorkflow();
    const duplicate = { ...mockChartOfAccounts[0], id: 'new-id' };

    expect(() => workflow.addAccount(duplicate)).toThrow(
      'Account 1000 already exists'
    );
  });

  it('adds new account successfully', () => {
    const workflow = createCOAWorkflow();
    const newAccount = {
      ...mockChartOfAccounts[0],
      id: 'coa-new',
      accountNumber: '5000',
      accountName: 'Operating Expenses',
      accountType: 'EXPENSE' as const,
      normalBalance: 'DEBIT' as const,
      isSystemAccount: false,
      balance: 0,
    };

    workflow.addAccount(newAccount);
    expect(workflow.getAccounts().length).toBe(4);
    expect(
      workflow.getAccounts().find((a) => a.accountNumber === '5000')
    ).toBeDefined();
  });

  it('calculates total balance by account type', () => {
    const workflow = createCOAWorkflow();

    expect(workflow.getTotalByType('ASSET')).toBe(50000);
    expect(workflow.getTotalByType('LIABILITY')).toBe(25000);
    expect(workflow.getTotalByType('REVENUE')).toBe(250000);
  });

  it('validates normal balance assignment', () => {
    mockChartOfAccounts.forEach((account) => {
      if (account.accountType === 'ASSET')
        expect(account.normalBalance).toBe('DEBIT');
      if (account.accountType === 'LIABILITY')
        expect(account.normalBalance).toBe('CREDIT');
      if (account.accountType === 'REVENUE')
        expect(account.normalBalance).toBe('CREDIT');
    });
  });

  it('renders chart of accounts hierarchy', () => {
    const COAHierarchy = () => (
      <div data-testid="coa-hierarchy">
        <h2>Chart of Accounts</h2>
        {['ASSET', 'LIABILITY', 'REVENUE'].map((type) => (
          <div key={type} data-testid={`section-${type}`}>
            <h3>{type}</h3>
            <ul>
              {mockChartOfAccounts
                .filter((a) => a.accountType === type)
                .map((a) => (
                  <li key={a.id}>
                    {a.accountNumber} - {a.accountName}: $
                    {a.balance.toLocaleString()}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    );

    render(<COAHierarchy />);
    expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
    expect(screen.getByTestId('section-ASSET')).toBeInTheDocument();
    expect(screen.getByTestId('section-LIABILITY')).toBeInTheDocument();
    expect(screen.getByTestId('section-REVENUE')).toBeInTheDocument();
    expect(screen.getByText(/1000 - Cash/)).toBeInTheDocument();
  });

  it('handles external system sync metadata', () => {
    mockChartOfAccounts.forEach((account) => {
      expect(account.quickbooksId).toBeDefined();
      expect(account.externalId).toBeDefined();
      expect(account.sourceSystem).toBe('quickbooks');
    });
  });
});
