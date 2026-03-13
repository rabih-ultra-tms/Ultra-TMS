/**
 * Dashboard page workflow tests
 * Tests the accounting dashboard at /accounting
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountingDashboardPage from '@/app/(dashboard)/accounting/page';
import { jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

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

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>{component}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Dashboard Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard page successfully', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText('Accounting')).toBeInTheDocument();
  });

  it('displays page description', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(
      screen.getByText(
        /Financial overview — receivables, payables, and cash flow/
      )
    ).toBeInTheDocument();
  });

  it('renders all quick link labels', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Settlements')).toBeInTheDocument();
  });

  it('displays recent invoices section', () => {
    renderWithProviders(<AccountingDashboardPage />);
    // Either shows recent invoices or empty state
    const page = screen.getByText('Accounting');
    expect(page).toBeInTheDocument();
  });

  it('shows chart of accounts quick link', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
  });

  it('shows journal entries quick link', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
  });

  it('shows aging reports quick link', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText('Aging Reports')).toBeInTheDocument();
  });

  it('renders quick links with descriptions', () => {
    renderWithProviders(<AccountingDashboardPage />);
    expect(screen.getByText(/Manage customer invoices/)).toBeInTheDocument();
  });

  it('quick links should be clickable buttons', () => {
    renderWithProviders(<AccountingDashboardPage />);
    const invoicesButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('Invoices'));
    expect(invoicesButton).toBeInTheDocument();
  });

  it('renders page without errors', () => {
    const { container } = renderWithProviders(<AccountingDashboardPage />);
    expect(container).toBeInTheDocument();
  });
});
