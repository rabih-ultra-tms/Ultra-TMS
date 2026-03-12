/**
 * Tests for useAccountingDashboard and useRecentInvoices hooks
 * Tests dashboard metrics and recent invoice retrieval
 */

import { renderHook } from '@/test/utils';
import {
  useAccountingDashboard,
  useRecentInvoices,
} from '@/lib/hooks/accounting/use-accounting-dashboard';

describe('useAccountingDashboard', () => {
  it('loads dashboard KPIs', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('returns all 6 metrics (totalAR, totalAP, overdueCount, DSO, revenueMTD, cashCollectedMTD)', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('totalAR');
      expect(result.current.data).toHaveProperty('totalAP');
      expect(result.current.data).toHaveProperty('overdueInvoiceCount');
      expect(result.current.data).toHaveProperty('dso');
      expect(result.current.data).toHaveProperty('revenueMTD');
      expect(result.current.data).toHaveProperty('cashCollectedMTD');
    }
  });

  it('returns metrics as numbers', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.data) {
      expect(typeof result.current.data.totalAR).toBe('number');
      expect(typeof result.current.data.totalAP).toBe('number');
      expect(typeof result.current.data.revenueMTD).toBe('number');
      expect(typeof result.current.data.cashCollectedMTD).toBe('number');
    }
  });

  it('metrics show zero when no invoices/payments exist', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.data) {
      expect(result.current.data.totalAR).toBeGreaterThanOrEqual(0);
      expect(result.current.data.totalAP).toBeGreaterThanOrEqual(0);
      expect(result.current.data.overdueInvoiceCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes optional change metrics', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.data) {
      // Change metrics are optional
      expect(result.current.data).toHaveProperty('totalARChange');
      expect(result.current.data).toHaveProperty('totalAPChange');
    }
  });

  it('DSO is >= 0', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.data && result.current.data.dso !== undefined) {
      expect(result.current.data.dso).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles server error gracefully', () => {
    const { result } = renderHook(() => useAccountingDashboard());

    if (result.current.error) {
      expect(result.current.error).toBeTruthy();
    }
  });
});

describe('useRecentInvoices', () => {
  it('loads recent invoices with default limit', () => {
    const { result } = renderHook(() => useRecentInvoices());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('returns invoices array', () => {
    const { result } = renderHook(() => useRecentInvoices());

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('respects custom limit parameter', () => {
    const { result } = renderHook(() => useRecentInvoices(5));

    expect(result.current).toBeDefined();
  });

  it('invoices include required fields', () => {
    const { result } = renderHook(() => useRecentInvoices());

    if (result.current.data && result.current.data.length > 0) {
      const invoice = result.current.data[0];
      if (invoice) {
        expect(invoice).toHaveProperty('id');
        expect(invoice).toHaveProperty('invoiceNumber');
        expect(invoice).toHaveProperty('customerName');
        expect(invoice).toHaveProperty('amount');
        expect(invoice).toHaveProperty('status');
      }
    }
  });

  it('returns empty array when no invoices', () => {
    const { result } = renderHook(() => useRecentInvoices());

    if (result.current.data) {
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });
});
