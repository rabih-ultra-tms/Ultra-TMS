/**
 * Data Validation Workflow Integration Tests
 * Tests cross-field validation, business rule enforcement, and data integrity
 */
import '@testing-library/react';
import { jest } from '@jest/globals';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
  mockPaymentsMade,
  mockInvoiceLineItems,
  mockSettlementLineItems,
} from '@/test/data/accounting-fixtures';

jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), prefetch: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Data Validation Workflow', () => {
  describe('Invoice Validation', () => {
    it('validates invoice total equals subtotal + tax', () => {
      mockInvoices.forEach((inv) => {
        expect(inv.totalAmount).toBe(inv.subtotal + inv.taxAmount);
      });
    });

    it('validates balance due equals total minus paid', () => {
      mockInvoices.forEach((inv) => {
        if (inv.status !== 'VOID') {
          expect(inv.balanceDue).toBe(inv.totalAmount - inv.amountPaid);
        }
      });
    });

    it('validates paid invoices have zero balance', () => {
      const paidInvoices = mockInvoices.filter((i) => i.status === 'PAID');
      paidInvoices.forEach((inv) => {
        expect(inv.balanceDue).toBe(0);
        expect(inv.amountPaid).toBe(inv.totalAmount);
      });
    });

    it('validates voided invoices have zero balance', () => {
      const voidedInvoices = mockInvoices.filter((i) => i.status === 'VOID');
      voidedInvoices.forEach((inv) => {
        expect(inv.balanceDue).toBe(0);
        expect(inv.voidedAt).toBeDefined();
        expect(inv.voidReason).toBeDefined();
      });
    });

    it('validates invoice dates are chronological', () => {
      mockInvoices.forEach((inv) => {
        const invoiceDate = new Date(inv.invoiceDate);
        const dueDate = new Date(inv.dueDate);
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(invoiceDate.getTime());
      });
    });

    it('validates sent invoices have sentAt timestamp', () => {
      const sentInvoices = mockInvoices.filter((i) =>
        ['SENT', 'PAID'].includes(i.status)
      );
      sentInvoices.forEach((inv) => {
        expect(inv.sentAt).toBeDefined();
      });
    });

    it('validates invoice numbers are unique', () => {
      const numbers = mockInvoices.map((i) => i.invoiceNumber);
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });

    it('validates all invoices have line items', () => {
      mockInvoices.forEach((inv) => {
        expect(inv.lineItems).toBeDefined();
        expect(inv.lineItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Settlement Validation', () => {
    it('validates net amount equals gross minus deductions', () => {
      mockSettlements.forEach((s) => {
        expect(s.netAmount).toBe(s.grossAmount - s.deductions);
      });
    });

    it('validates deductions are non-negative', () => {
      mockSettlements.forEach((s) => {
        expect(s.deductions).toBeGreaterThanOrEqual(0);
      });
    });

    it('validates settlement numbers are unique', () => {
      const numbers = mockSettlements.map((s) => s.settlementNumber);
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });

    it('validates approved settlements have approval metadata', () => {
      const approved = mockSettlements.filter(
        (s) => s.status === 'APPROVED' || s.status === 'PROCESSED'
      );
      approved.forEach((s) => {
        expect(s.approvedAt).toBeDefined();
        expect(s.approvedBy).toBeDefined();
      });
    });

    it('validates processed settlements have processing metadata', () => {
      const processed = mockSettlements.filter((s) => s.status === 'PROCESSED');
      processed.forEach((s) => {
        expect(s.processedAt).toBeDefined();
      });
    });

    it('validates all settlements have line items', () => {
      mockSettlements.forEach((s) => {
        expect(s.lineItems).toBeDefined();
        expect(s.lineItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Payment Validation', () => {
    it('validates payment amounts are positive', () => {
      mockPaymentsReceived.forEach((p) => {
        expect(p.amount).toBeGreaterThan(0);
      });
      mockPaymentsMade.forEach((p) => {
        expect(p.amount).toBeGreaterThan(0);
      });
    });

    it('validates payment numbers are unique', () => {
      const receivedNumbers = mockPaymentsReceived.map((p) => p.paymentNumber);
      const madeNumbers = mockPaymentsMade.map((p) => p.paymentNumber);
      const allNumbers = [...receivedNumbers, ...madeNumbers];
      expect(new Set(allNumbers).size).toBe(allNumbers.length);
    });

    it('validates payment methods are valid', () => {
      const validMethods = ['CHECK', 'ACH', 'WIRE', 'CREDIT_CARD'];
      mockPaymentsReceived.forEach((p) => {
        expect(validMethods).toContain(p.method);
      });
      mockPaymentsMade.forEach((p) => {
        expect(validMethods).toContain(p.method);
      });
    });

    it('validates payment statuses are valid', () => {
      const validReceivedStatuses = ['RECEIVED', 'APPLIED', 'BOUNCED'];
      const validMadeStatuses = ['PENDING', 'SENT', 'CLEARED'];

      mockPaymentsReceived.forEach((p) => {
        expect(validReceivedStatuses).toContain(p.status);
      });
      mockPaymentsMade.forEach((p) => {
        expect(validMadeStatuses).toContain(p.status);
      });
    });

    it('validates payments have reference numbers', () => {
      mockPaymentsReceived.forEach((p) => {
        expect(p.referenceNumber).toBeDefined();
      });
    });

    it('validates payments have timestamps', () => {
      mockPaymentsReceived.forEach((p) => {
        expect(p.createdAt).toBeDefined();
        expect(p.updatedAt).toBeDefined();
        expect(new Date(p.createdAt).getTime()).toBeLessThanOrEqual(
          new Date(p.updatedAt).getTime()
        );
      });
    });
  });

  describe('Line Item Validation', () => {
    it('validates invoice line item amounts are positive', () => {
      mockInvoiceLineItems.forEach((li) => {
        expect(li.amount).toBeGreaterThan(0);
        expect(li.quantity).toBeGreaterThan(0);
        expect(li.unitPrice).toBeGreaterThan(0);
      });
    });

    it('validates line item amount equals quantity * unitPrice', () => {
      mockInvoiceLineItems.forEach((li) => {
        expect(li.amount).toBe(li.quantity * li.unitPrice);
      });
    });

    it('validates settlement line item amounts are positive', () => {
      mockSettlementLineItems.forEach((li) => {
        expect(li.amount).toBeGreaterThan(0);
        expect(li.description).toBeDefined();
      });
    });

    it('validates line items have descriptions', () => {
      mockInvoiceLineItems.forEach((li) => {
        expect(li.description).toBeDefined();
        expect(li.description.length).toBeGreaterThan(0);
      });
    });
  });
});
