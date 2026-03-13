'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/lib/hooks/documents/use-documents';
import {
  DocumentList,
  DocumentItem,
} from '@/components/tms/documents/document-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { FileUp, File } from 'lucide-react';

export default function DocumentDashboard() {
  const router = useRouter();
  const { data: documents, isLoading } = useDocuments('LOAD', 'demo-load-id');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents based on search query
  const filteredDocuments =
    documents?.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Convert documents to DocumentItem format
  const documentItems: DocumentItem[] = filteredDocuments.map((doc) => ({
    key: doc.id,
    name: doc.name,
    status: doc.status === 'UPLOADED' ? 'complete' : 'pending',
    statusText: doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleDateString()
      : 'Pending',
    downloadable: doc.status === 'UPLOADED',
    uploadable: doc.status !== 'UPLOADED',
    onDownload: () => router.push(`/documents/${doc.id}`),
    onUpload: () => router.push('/documents/upload'),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage and track all your documents
          </p>
        </div>
        <Button
          onClick={() => router.push('/documents/upload')}
          className="gap-2"
        >
          <FileUp className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading documents...</p>
        </div>
      ) : documentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-slate-50">
          <File className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-600">No documents found</p>
          <p className="text-slate-500 text-sm">
            Upload your first document to get started
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-white">
          <DocumentList documents={documentItems} />
        </div>
      )}
    </div>
  );
}
