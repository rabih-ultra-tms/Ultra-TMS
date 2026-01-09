/* eslint-disable no-undef */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Pagination from '@/components/ui/Pagination';
import { apiClient } from '@/lib/api';

interface Document {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  status: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader?: {
    firstName: string;
    lastName: string;
  };
  load?: { id: string; loadNumber: string };
  carrier?: { id: string; legalName: string };
  company?: { id: string; name: string };
}

const documentTypes = [
  { value: '', label: 'All Types' },
  { value: 'BOL', label: 'Bill of Lading' },
  { value: 'POD', label: 'Proof of Delivery' },
  { value: 'RATE_CONFIRM', label: 'Rate Confirmation' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'W9', label: 'W-9' },
  { value: 'CARRIER_AGREEMENT', label: 'Carrier Agreement' },
  { value: 'QUOTE', label: 'Quote' },
  { value: 'OTHER', label: 'Other' },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [pagination.page, documentType]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (documentType) params.append('documentType', documentType);

      const response = await apiClient.get<{ data: Document[]; pagination: { total: number; totalPages: number } }>(`/documents?${params}`);
      setDocuments(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDocuments();
  }

  function toggleDocSelection(id: string) {
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocs(newSelection);
  }

  function selectAllDocs() {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map((d) => d.id)));
    }
  }

  async function handleBulkDelete() {
    if (selectedDocs.size === 0) return;
    if (!confirm(`Delete ${selectedDocs.size} document(s)?`)) return;

    try {
      await apiClient.post('/documents/bulk-delete', {
        documentIds: Array.from(selectedDocs),
      });
      setSelectedDocs(new Set());
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting documents:', error);
    }
  }

  async function handleDownload(doc: Document) {
    try {
      const response = await apiClient.get<{ url: string }>(`/documents/${doc.id}/download`);
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Documents</h1>
          <p className="mt-0.5 text-sm text-slate-600">Manage all your documents in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/documents/templates"
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 text-sm"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />
            Templates
          </Link>
          <Link
            href="/documents/folders"
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 text-sm"
          >
            <FolderIcon className="h-4 w-4 mr-1.5" />
            Folders
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" />
            Upload
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-md border border-slate-200 mb-4">
        <div className="p-3 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm ${
                showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-300 text-slate-700'
              }`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-900 text-sm"
            >
              Search
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedDocs.size > 0 && (
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-blue-800">{selectedDocs.size} document(s) selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocs.size === documents.length && documents.length > 0}
                    onChange={selectAllDocs}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Associated With</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <DocumentIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No documents found</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Upload your first document
                    </button>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => toggleDocSelection(doc.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/documents/${doc.id}`} className="hover:text-blue-600">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.fileName}</div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {documentTypes.find((t) => t.value === doc.documentType)?.label || doc.documentType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.load && (
                        <Link href={`/loads/${doc.load.id}`} className="text-blue-600 hover:underline">
                          Load {doc.load.loadNumber}
                        </Link>
                      )}
                      {doc.carrier && (
                        <Link href={`/carriers/${doc.carrier.id}`} className="text-blue-600 hover:underline">
                          {doc.carrier.legalName}
                        </Link>
                      )}
                      {doc.company && (
                        <Link href={`/crm/companies/${doc.company.id}`} className="text-blue-600 hover:underline">
                          {doc.company.name}
                        </Link>
                      )}
                      {!doc.load && !doc.carrier && !doc.company && (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{formatDate(doc.createdAt)}</div>
                      {doc.uploader && (
                        <div className="text-xs text-gray-400">
                          by {doc.uploader.firstName} {doc.uploader.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusColors[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <Link
                          href={`/documents/${doc.id}`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                          <ShareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          itemName="documents"
        />
      </div>

      {/* Upload Modal - Simplified for now */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <p className="text-slate-600 mb-4">
              Document upload functionality will be implemented with file storage integration.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
