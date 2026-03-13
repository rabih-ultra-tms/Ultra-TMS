'use client';

import type { MockDocument } from '@/lib/mocks/documents';
import { DocumentCard } from './DocumentCard';
import { useState } from 'react';

interface DocumentListProps {
  documents: MockDocument[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function DocumentList({
  documents,
  onDelete,
  onView,
}: DocumentListProps) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    onDelete(id);
  };

  const visibleDocuments = documents.filter((doc) => !deletedIds.has(doc.id));

  if (visibleDocuments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <p className="text-slate-600">No documents found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleDocuments.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={handleDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
