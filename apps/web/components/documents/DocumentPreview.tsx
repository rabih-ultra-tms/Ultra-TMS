'use client';

import { X } from 'lucide-react';
import type { MockDocument } from '@/lib/mocks/documents';
import { Button } from '@/components/ui/button';

interface DocumentPreviewProps {
  document: MockDocument | null;
  onClose: () => void;
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  if (!document) return null;

  const isImage = ['image'].includes(document.type);
  const isPDF = document.type === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative h-[90vh] w-[90vw] rounded-lg bg-white p-6 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="mb-4 text-lg font-semibold">{document.name}</h2>

        <div className="flex h-full flex-col items-center justify-center">
          {isImage ? (
            <img
              src={`/images/${document.name}`}
              alt={document.name}
              className="max-h-[calc(90vh-120px)] max-w-full object-contain"
            />
          ) : isPDF ? (
            <div className="text-center text-slate-600">
              <p>PDF preview not available</p>
              <p className="text-sm">Download to view the file</p>
            </div>
          ) : (
            <div className="text-center text-slate-600">
              <p>Preview not available for {document.type} files</p>
              <p className="text-sm">Download to view the file</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
