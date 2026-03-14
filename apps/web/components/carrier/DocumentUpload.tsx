/* eslint-disable no-undef */
'use client';

import { useState, useCallback } from 'react';
import {
  useUploadCarrierDocument,
  useDeleteCarrierDocument,
  useCarrierDocuments,
  CarrierDocumentType,
  type CarrierDocument,
} from '@/lib/hooks/carrier/use-carrier-documents';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DOCUMENT_TYPES: { value: CarrierDocumentType; label: string }[] = [
  { value: 'POD', label: 'Proof of Delivery (POD)' },
  { value: 'LUMPER_RECEIPT', label: 'Lumper Receipt' },
  { value: 'SCALE_TICKET', label: 'Scale Ticket' },
  { value: 'BOL_SIGNED', label: 'Signed Bill of Lading' },
  { value: 'WEIGHT_TICKET', label: 'Weight Ticket' },
  { value: 'OTHER', label: 'Other' },
];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

interface DocumentUploadProps {
  loadId?: string;
}

export function DocumentUpload({ loadId }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<CarrierDocumentType>('POD');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadCarrierDocument();
  const deleteMutation = useDeleteCarrierDocument();
  const { data: documents, isLoading } = useCarrierDocuments();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      setError(null);

      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress > 90) progress = 90;
          setUploadProgress(Math.floor(progress));
        }, 200);

        try {
          await uploadMutation.mutateAsync({
            file,
            documentType: selectedType,
            loadId,
          });

          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
          }, 1000);
        } finally {
          clearInterval(progressInterval);
        }
      }
    },
    [selectedType, loadId, uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUploadFiles(files);
      }
    },
    [handleUploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.currentTarget.files || []);
      if (files.length > 0) {
        handleUploadFiles(files);
      }
    },
    [handleUploadFiles]
  );

  const handleDelete = async (documentId: string) => {
    deleteMutation.mutate(documentId);
    setDeleteConfirm(null);
  };

  const handleDownload = (doc: CarrierDocument) => {
    // Create a download link using the file path
    const link = document.createElement('a');
    link.href = doc.filePath;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocuments = loadId
    ? (documents?.filter((doc) => doc.loadId === loadId) ?? [])
    : (documents ?? []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">
              Document Type
            </label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as CarrierDocumentType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            } ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              disabled={uploadMutation.isPending}
              accept={ALLOWED_EXTENSIONS.join(',')}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-medium text-slate-900">
              Drag and drop files here
            </p>
            <p className="text-sm text-slate-600">
              or click to browse (PDF, JPEG, PNG, WebP - max 50MB)
            </p>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Uploading...</span>
                <span className="text-slate-900 font-medium">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {uploadMutation.isPending && (
            <p className="text-sm text-slate-600">Processing file...</p>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents{' '}
            {filteredDocuments.length > 0 && `(${filteredDocuments.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm text-slate-500">
                No documents uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>{doc.documentType}</span>
                        <span>•</span>
                        <span>
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(doc.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Badge */}
                    {doc.status !== 'UPLOADED' && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}
                      >
                        {getStatusIcon(doc.status)}
                        <span>{doc.status}</span>
                      </div>
                    )}

                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
