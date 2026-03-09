'use client';

import { useQuery } from '@tanstack/react-query';
import { portalApi } from '@/lib/api/portal-client';

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface PortalDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  createdAt: string;
  shipmentId?: string;
}

export const portalDocumentKeys = {
  all: ['portal-documents'] as const,
  invoices: () => [...portalDocumentKeys.all, 'invoices'] as const,
  shipmentDocs: (id: string) => [...portalDocumentKeys.all, 'shipment', id] as const,
};

export function usePortalInvoices() {
  return useQuery({
    queryKey: portalDocumentKeys.invoices(),
    queryFn: async () => {
      const response = await portalApi.get<{ data: PortalInvoice[] }>('/portal/invoices');
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function usePortalShipmentDocuments(shipmentId: string) {
  return useQuery({
    queryKey: portalDocumentKeys.shipmentDocs(shipmentId),
    queryFn: async () => {
      const response = await portalApi.get<{ data: PortalDocument[] }>(
        `/portal/shipments/${shipmentId}/documents`,
      );
      return response.data;
    },
    enabled: !!shipmentId,
  });
}
