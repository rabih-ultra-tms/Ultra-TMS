'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useDocuments,
  useDocumentDownloadUrl,
} from '@/lib/hooks/documents/use-documents';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  File,
  FileText,
  Image,
  AlertCircle,
} from 'lucide-react';

export default function DocumentViewerPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const { data: documents, isLoading } = useDocuments('LOAD', 'demo-load-id');
  const { refetch: getDownloadUrl, isLoading: isDownloading } =
    useDocumentDownloadUrl(documentId);

  const document = documents?.find((d) => d.id === documentId);

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const handleDownload = async () => {
    await getDownloadUrl();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Document not found
            </p>
            <p className="text-xs text-red-700">
              This document does not exist or has been deleted
            </p>
          </div>
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{document.name}</h1>
            <p className="text-slate-600 text-sm mt-1">
              {document.description}
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg bg-slate-50 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 mb-3 flex justify-center">
                {getFileIcon(document.mimeType)}
              </div>
              <p className="text-slate-600 font-medium">{document.fileName}</p>
              <p className="text-slate-500 text-sm mt-1">{document.mimeType}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleDownload}
              >
                View Full Document
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="font-bold mb-4">Document Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Type
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {document.documentType}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Size
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {(document.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Uploaded
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Time
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {new Date(document.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {document.createdByUser && (
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">
                  Uploaded By
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {document.createdByUser.firstName}{' '}
                  {document.createdByUser.lastName}
                </p>
              </div>
            )}

            {document.status && (
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">
                  Status
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {document.status}
                </p>
              </div>
            )}

            {document.tags && document.tags.length > 0 && (
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Back to Documents
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
