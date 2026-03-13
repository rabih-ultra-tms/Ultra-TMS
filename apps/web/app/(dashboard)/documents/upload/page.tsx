'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadDocument } from '@/lib/hooks/documents/use-documents';
import { UploadZone } from '@/components/tms/documents/upload-zone';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import type { DocumentType } from '@/lib/hooks/documents/use-documents';

export default function DocumentUploadPage() {
  const router = useRouter();
  const {
    mutate: upload,
    isPending,
    isSuccess,
    isError,
    error,
  } = useUploadDocument();
  const [selectedFiles, setSelectedFiles] = useState<globalThis.File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');

  const handleFilesDrop = (files: globalThis.FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...fileArray]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      upload({
        file,
        name: file.name,
        documentType,
        entityType: 'LOAD',
        entityId: 'demo-load-id',
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
      <p className="text-slate-600 mb-6">
        Select files and choose a document type, then upload
      </p>

      <div className="border rounded-lg p-6 bg-white space-y-6">
        {/* Upload Zone */}
        <div>
          <label className="text-sm font-medium mb-3 block">Select Files</label>
          <UploadZone
            variant="full"
            text="Drop files here or click to upload"
            onDrop={handleFilesDrop}
          />
        </div>

        {/* Document Type Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Document Type
          </label>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value as DocumentType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BOL">Bill of Lading (BOL)</SelectItem>
              <SelectItem value="POD">Proof of Delivery (POD)</SelectItem>
              <SelectItem value="RATE_CONFIRM">Rate Confirmation</SelectItem>
              <SelectItem value="INVOICE">Invoice</SelectItem>
              <SelectItem value="INSURANCE">Insurance Certificate</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="W9">W-9 Form</SelectItem>
              <SelectItem value="CARRIER_AGREEMENT">
                Carrier Agreement
              </SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">
              Selected Files ({selectedFiles.length})
            </label>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {isSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Upload successful
              </p>
              <p className="text-xs text-green-700">
                Your documents have been uploaded
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Upload failed</p>
              <p className="text-xs text-red-700">
                {error?.message || 'Unknown error'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isPending}
          >
            {isPending ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </div>
      </div>
    </div>
  );
}
