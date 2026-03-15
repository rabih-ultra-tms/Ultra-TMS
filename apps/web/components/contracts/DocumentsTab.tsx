'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Upload } from 'lucide-react';

interface DocumentsTabProps {
  attachments: string[];
}

export default function DocumentsTab({
  attachments,
}: DocumentsTabProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-4 text-sm text-text-muted">
            No documents have been attached yet
          </p>
          <Button size="sm" className="gap-2">
            <Upload className="size-4" />
            Upload Document
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button size="sm" className="gap-2">
          <Upload className="size-4" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-blue-600" />
                <div>
                  <p className="font-medium text-text-primary">
                    {typeof attachment === 'string'
                      ? attachment.split('/').pop() || `Document ${index + 1}`
                      : `Document ${index + 1}`}
                  </p>
                  <p className="text-xs text-text-muted">Contract Document</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Download className="size-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
