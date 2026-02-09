'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CarrierDocumentsSectionProps {
  carrierId: string;
}

export function CarrierDocumentsSection({ carrierId: _carrierId }: CarrierDocumentsSectionProps) {
  // Documents endpoint hooks will be added in CARR-002 (Phase 2)
  // For now, show empty state to eliminate the 404
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="font-medium">No documents uploaded</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Upload carrier documents like W-9, carrier agreement, and insurance certificates.
          Document management will be available in a future update.
        </p>
      </CardContent>
    </Card>
  );
}
