/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  LinkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

interface DocumentDetail {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  status: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  storageProvider: string;
  entityType?: string;
  entityId?: string;
  tags: string[];
  ocrProcessed: boolean;
  ocrText?: string;
  isLatestVersion: boolean;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  load?: { id: string; loadNumber: string; status: string };
  order?: { id: string; orderNumber: string };
  carrier?: { id: string; legalName: string; mcNumber: string };
  company?: { id: string; name: string };
  versions?: DocumentDetail[];
}

interface DocumentShare {
  id: string;
  shareType: string;
  accessToken: string;
  expiresAt?: string;
  maxViews?: number;
  maxDownloads?: number;
  viewCount: number;
  downloadCount: number;
  allowDownload: boolean;
  createdAt: string;
}

const documentTypes: Record<string, string> = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  RATE_CONFIRM: 'Rate Confirmation',
  INVOICE: 'Invoice',
  INSURANCE: 'Insurance Certificate',
  CONTRACT: 'Contract',
  W9: 'W-9 Form',
  CARRIER_AGREEMENT: 'Carrier Agreement',
  QUOTE: 'Quote',
  STATEMENT: 'Statement',
  OTHER: 'Other',
};

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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [versions, setVersions] = useState<DocumentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'shares'>('details');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  async function fetchDocument() {
    setLoading(true);
    try {
      const [docResponse, sharesResponse, versionsResponse] = await Promise.all([
        apiClient.get<DocumentDetail>(`/documents/${documentId}`),
        apiClient.get<DocumentShare[]>(`/documents/${documentId}/shares`).catch(() => []),
        apiClient.get<DocumentDetail[]>(`/documents/${documentId}/versions`).catch(() => []),
      ]);
      setDocument(docResponse);
      setShares(sharesResponse);
      setVersions(versionsResponse);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const response = await apiClient.get<{ url: string }>(`/documents/${documentId}/download`);
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  }

  async function handlePreview() {
    try {
      const response = await apiClient.get<{ url: string }>(`/documents/${documentId}/preview`);
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Error previewing document:', error);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiClient.delete(`/documents/${documentId}`);
      router.push('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  async function handleArchive() {
    try {
      await apiClient.put(`/documents/${documentId}`, { status: 'ARCHIVED' });
      fetchDocument();
    } catch (error) {
      console.error('Error archiving document:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Document not found</h2>
          <Link href="/documents" className="text-blue-600 hover:underline">
            Back to documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/documents" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Documents
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
              <p className="text-gray-600">{document.fileName}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusColors[document.status]}`}>
                  {document.status}
                </span>
                <span className="text-sm text-gray-500">
                  {documentTypes[document.documentType] || document.documentType}
                </span>
                <span className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share
            </button>
            <div className="relative group">
              <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <PencilIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                <button
                  onClick={handleArchive}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                >
                  Archive
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {(['details', 'versions', 'shares'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'versions' && versions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{versions.length}</span>
              )}
              {tab === 'shares' && shares.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{shares.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            {document.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900">{document.description}</p>
              </div>
            )}

            {/* File Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">File Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">File Name</dt>
                  <dd className="text-gray-900">{document.fileName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">File Size</dt>
                  <dd className="text-gray-900">{formatFileSize(document.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">File Type</dt>
                  <dd className="text-gray-900">{document.mimeType}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Extension</dt>
                  <dd className="text-gray-900">{document.fileExtension}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Storage</dt>
                  <dd className="text-gray-900">{document.storageProvider}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Version</dt>
                  <dd className="text-gray-900">
                    v{document.versionNumber}
                    {document.isLatestVersion && (
                      <span className="ml-2 text-xs text-green-600">(Latest)</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* OCR Content */}
            {document.ocrProcessed && document.ocrText && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Extracted Text (OCR)</h3>
                <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {document.ocrText}
                </div>
              </div>
            )}

            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Associations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Associated With</h3>
              <div className="space-y-3">
                {document.load && (
                  <Link
                    href={`/loads/${document.load.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Load {document.load.loadNumber}</div>
                      <div className="text-sm text-gray-500">{document.load.status}</div>
                    </div>
                  </Link>
                )}
                {document.order && (
                  <Link
                    href={`/orders/${document.order.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Order {document.order.orderNumber}</div>
                    </div>
                  </Link>
                )}
                {document.carrier && (
                  <Link
                    href={`/carriers/${document.carrier.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{document.carrier.legalName}</div>
                      <div className="text-sm text-gray-500">MC# {document.carrier.mcNumber}</div>
                    </div>
                  </Link>
                )}
                {document.company && (
                  <Link
                    href={`/crm/companies/${document.company.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{document.company.name}</div>
                    </div>
                  </Link>
                )}
                {!document.load && !document.order && !document.carrier && !document.company && (
                  <p className="text-gray-500 text-sm">No associations</p>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-900">Created</div>
                    <div className="text-sm text-gray-500">{formatDateTime(document.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-900">Last Updated</div>
                    <div className="text-sm text-gray-500">{formatDateTime(document.updatedAt)}</div>
                  </div>
                </div>
                {document.uploader && (
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-900">Uploaded by</div>
                      <div className="text-sm text-gray-500">
                        {document.uploader.firstName} {document.uploader.lastName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-medium">Version History</h3>
          </div>
          {versions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No previous versions</p>
            </div>
          ) : (
            <div className="divide-y">
              {versions.map((version) => (
                <div key={version.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <DocumentIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Version {version.versionNumber}
                        {version.isLatestVersion && (
                          <span className="ml-2 text-xs text-green-600">(Current)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(version.createdAt)} • {formatFileSize(version.fileSize)}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shares' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">Shared Links</h3>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Create Link
            </button>
          </div>
          {shares.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShareIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No active share links</p>
            </div>
          ) : (
            <div className="divide-y">
              {shares.map((share) => (
                <div key={share.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {share.shareType} Link
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {formatDateTime(share.createdAt)}
                        {share.expiresAt && ` • Expires ${formatDateTime(share.expiresAt)}`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {share.viewCount} views • {share.downloadCount} downloads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal Placeholder */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Share Document</h2>
            <p className="text-gray-600 mb-4">
              Share link creation will generate a secure URL that can be shared with external parties.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
