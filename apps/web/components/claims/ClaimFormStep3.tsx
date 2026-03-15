/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState } from 'react';
import { useClaimFormStore } from '@/lib/stores/claim-form-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUp, File, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  png: 'image/png',
};

const ACCEPTED_EXTENSIONS = Object.keys(ACCEPTED_TYPES).join(', .');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const DOCUMENT_TYPES = [
  { value: 'BOL', label: 'Bill of Lading' },
  { value: 'POD', label: 'Proof of Delivery' },
  { value: 'DAMAGE_PHOTOS', label: 'Damage Photos' },
  { value: 'RECEIPT', label: 'Receipt/Invoice' },
  { value: 'OTHER', label: 'Other' },
];

export function ClaimFormStep3() {
  const formState = useClaimFormStore();
  const fileInputRef = useRef<any>(null);
  const dragOverlay = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const documents = formState.getDocuments();

  const handleDragOver = (e: any): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any): void => {
    if (e.target === dragOverlay.current) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: any): void => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: any[]) => {
    if (!selectedDocType) {
      toast.error('Please select a document type first');
      return;
    }

    files.forEach((file) => {
      // Validate file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !Object.keys(ACCEPTED_TYPES).includes(fileExt)) {
        toast.error(
          `${file.name} has an unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS}`
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size: 25 MB`);
        return;
      }

      // Add document
      formState.addDocument(file, selectedDocType);
      toast.success(`${file.name} added`);
    });
  };

  const handleDeleteDocument = (id: string) => {
    formState.removeDocument(id);
    setDeleteDocId(null);
    toast.success('Document removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-text-primary">
          Upload supporting documents for your claim (optional but recommended).
          Accepted formats: PDF, Office documents (DOC/XLS), and images
          (JPG/PNG). Maximum file size: 25 MB.
        </p>
      </Card>

      {/* Document Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Document Type
        </label>
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          <option value="">Select document type...</option>
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Area */}
      <div
        ref={dragOverlay}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
            : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900',
          !selectedDocType && 'pointer-events-none opacity-50'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <FileUp className="size-10 text-gray-400" />
          <div className="text-center">
            <p className="font-medium text-text-primary">
              Drag documents here or click to browse
            </p>
            <p className="text-xs text-text-muted">
              Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 25 MB)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedDocType}
          >
            Browse Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={!selectedDocType}
        />
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <Card className="divide-y">
          <div className="p-4 font-medium text-text-primary">
            Uploaded Documents ({documents.length})
          </div>
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <File className="size-5 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">
                    {doc.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatFileSize(doc.size)} • {doc.documentType}
                    {doc.isUploading && ' • Uploading...'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDocId(doc.id)}
                disabled={doc.isUploading}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="flex h-24 flex-col items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-sm text-text-muted">No documents uploaded yet.</p>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-950">
        <h3 className="mb-2 text-sm font-medium text-text-primary">
          Step 3 Status
        </h3>
        <ul className="space-y-1 text-xs text-text-muted">
          <li>
            {documents.length > 0 ? '✓' : '○'} Documents uploaded:{' '}
            {documents.length > 0 ? documents.length : 'None (optional)'}
          </li>
          <li>
            Documents are optional but highly recommended for faster claim
            processing.
          </li>
        </ul>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDocId !== null}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this document from the claim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDocId(null)}>
              Keep Document
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDocId && handleDeleteDocument(deleteDocId)}
            >
              Remove Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
