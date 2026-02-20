'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/tms/primitives/status-badge';
import { FileText, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarrierDocumentsSectionProps {
  carrierId: string;
}

/** Standard carrier document types expected for compliance */
const REQUIRED_DOCUMENTS = [
  { type: 'W-9', label: 'W-9 Tax Form', required: true },
  { type: 'CARRIER_AGREEMENT', label: 'Carrier Agreement', required: true },
  { type: 'INSURANCE_CERT', label: 'Insurance Certificate', required: true },
  { type: 'AUTHORITY', label: 'Operating Authority', required: true },
  { type: 'SAFETY_RATING', label: 'Safety Rating Letter', required: false },
] as const;

export function CarrierDocumentsSection({ carrierId }: CarrierDocumentsSectionProps) {
  void carrierId;

  // TODO: Wire to carrier documents API when available
  // For now, show document checklist with empty states
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Required Documents
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {REQUIRED_DOCUMENTS.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    {doc.required && (
                      <p className="text-xs text-muted-foreground">Required</p>
                    )}
                  </div>
                </div>
                <StatusBadge status="unassigned" size="sm">
                  Not Uploaded
                </StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning-border bg-warning-bg/30">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Document upload coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              Document management with expiration tracking and automated alerts will be available in a future update.
              Expired or expiring documents will show amber ({'<'}30 days) and red (expired) warnings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
