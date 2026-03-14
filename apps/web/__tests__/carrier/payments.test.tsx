'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentsPage from '@/app/(carrier)/carrier/payments/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('Carrier Payments Page', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders payments page with title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PaymentsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Payments & Settlements')).toBeInTheDocument();
    expect(
      screen.getByText('View payment history and settlement status')
    ).toBeInTheDocument();
  });

  it('displays summary cards', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PaymentsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('Pending Payments')).toBeInTheDocument();
    expect(screen.getByText('Last Payment Date')).toBeInTheDocument();
    expect(screen.getByText('Total Payments')).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PaymentsPage />
      </QueryClientProvider>
    );

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('displays loading state while fetching data', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PaymentsPage />
      </QueryClientProvider>
    );

    // Should have loading skeleton while data is being fetched
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
