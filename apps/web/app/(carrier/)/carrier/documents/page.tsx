'use client';

import { DocumentUpload } from '@/components/carrier/DocumentUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { useCarrierDocuments } from '@/lib/hooks/carrier/use-carrier-documents';

export default function CarrierDocumentsPage() {
  const { isLoading } = useCarrierDocuments();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
        <p className="mt-2 text-slate-600">
          Upload required compliance documents including POD, insurance
          certificates, and other documentation
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <DocumentUpload />
      )}
    </div>
  );
}
