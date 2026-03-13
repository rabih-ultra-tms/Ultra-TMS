'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvoiceDetail } from './InvoiceDetail';
import { PortalInvoice } from '@/lib/hooks/portal/use-portal-documents';
import { FileText } from 'lucide-react';

type Invoice = PortalInvoice;

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const [filter, setFilter] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    if (!filter) return true;
    return inv.status.toLowerCase() === filter.toLowerCase();
  });

  const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('paid')) return statusColors['paid'];
    if (statusLower.includes('overdue')) return statusColors['overdue'];
    return statusColors['unpaid'];
  };

  const filterOptions = [
    { label: 'All', value: '' },
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Overdue', value: 'overdue' },
  ];

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Invoices
            </h3>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    filter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm text-slate-500">
                {invoices.length === 0
                  ? 'No invoices found'
                  : 'No invoices match the selected filter'}
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Issue Date
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-bold">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(invoice)}
                          className="hover:bg-blue-50"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
