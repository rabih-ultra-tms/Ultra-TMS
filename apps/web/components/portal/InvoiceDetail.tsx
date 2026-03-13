'use client';

import { Button } from '@/components/ui/button';
import { portalClient } from '@/lib/api/portal-client';
import { X } from 'lucide-react';
import { PortalInvoice } from '@/lib/hooks/portal/use-portal-documents';

export type Invoice = PortalInvoice;

export function InvoiceDetail({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const handleDownloadPdf = async () => {
    try {
      const response = await portalClient.getInvoicePdf(invoice.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('paid')) return 'text-green-600';
    if (statusLower.includes('overdue')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal box */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg leading-6 font-semibold text-slate-900">
              Invoice {invoice.invoiceNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Created Date:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </div>

              {invoice.dueDate && (
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">
                    Due Date:
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Amount:
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ${invoice.amount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  Status:
                </span>
                <span
                  className={`text-sm font-semibold capitalize ${getStatusColor(invoice.status)}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <Button
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Download PDF
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
