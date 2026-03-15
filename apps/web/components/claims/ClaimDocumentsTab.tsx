'use client';

import React, { useState, useRef } from 'react';
import { ClaimDocument, CreateClaimDocumentDTO } from '@/lib/api/claims/types';
import { claimDocumentsClient } from '@/lib/api/claims';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Download, Trash2, File, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ClaimDocumentsTabProps {
  claimId: string;
  documents: ClaimDocument[];
  onDocumentsChange: () => void;
}

function getFileIcon(documentType: string) {
  if (documentType.includes('pdf')) {
    return <FileText className="size-5 text-red-500" />;
  }
  if (
    documentType.includes('image') ||
    ['jpg', 'jpeg', 'png', 'gif'].includes(documentType)
  ) {
    return <Image className="size-5 text-blue-500" />;
  }
  return <File className="size-5 text-gray-500" />;
}

function getFileName(url: string): string {
  return url.split('/').pop()?.split('?')[0] || 'Document';
}

export function ClaimDocumentsTab({
  claimId,
  documents,
  onDocumentsChange,
}: ClaimDocumentsTabProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteDocument = async () => {
    if (!deleteConfirmId) return;
    try {
      setIsSubmitting(true);
      await claimDocumentsClient.deleteDocument(claimId, deleteConfirmId);
      toast.success('Document deleted successfully');
      setDeleteConfirmId(null);
      onDocumentsChange();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // In a real implementation, upload to storage and get back a URL
      // For now, we'll create a simple data URL or blob URL
      const fileUrl = URL.createObjectURL(file);

      const documentData: CreateClaimDocumentDTO = {
        fileName: file.name,
        fileUrl: fileUrl,
        documentType: file.type || 'application/octet-stream',
      };

      await claimDocumentsClient.addDocument(claimId, documentData);
      toast.success('Document uploaded successfully');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDocumentsChange();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload document';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Plus className="mr-2 size-4" />
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No documents yet. Upload one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(doc.documentType)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">
                        {getFileName(doc.fileName)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDate(doc.uploadedAt)} by{' '}
                        {doc.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="ghost" size="icon">
                        <Download className="size-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(doc.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
