import { useState, useEffect } from 'react';
import { MOCK_DOCUMENTS, MOCK_FOLDERS } from '../mocks/documents';

export interface UseDocumentsReturn {
  documents: typeof MOCK_DOCUMENTS;
  folders: typeof MOCK_FOLDERS;
  loading: boolean;
  searchDocuments: (query: string) => typeof MOCK_DOCUMENTS;
  filterByFolder: (folderId: string) => typeof MOCK_DOCUMENTS;
}

export function useDocuments(): UseDocumentsReturn {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const searchDocuments = (query: string) =>
    MOCK_DOCUMENTS.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase()) && !doc.deletedAt
    );

  const filterByFolder = (folderId: string) =>
    MOCK_DOCUMENTS.filter((doc) => doc.folderId === folderId && !doc.deletedAt);

  return {
    documents: MOCK_DOCUMENTS.filter((doc) => !doc.deletedAt),
    folders: MOCK_FOLDERS,
    loading,
    searchDocuments,
    filterByFolder,
  };
}
