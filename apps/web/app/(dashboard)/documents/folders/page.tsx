/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderIcon,
  FolderPlusIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

interface Folder {
  id: string;
  name: string;
  description?: string;
  path: string;
  parentFolderId?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  _count?: {
    documents: number;
    children: number;
  };
}

interface FolderDocument {
  id: string;
  document: {
    id: string;
    name: string;
    documentType: string;
    fileSize: number;
    createdAt: string;
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<FolderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchFolders();
  }, [currentFolder]);

  async function fetchFolders(parentFolderId?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (parentFolderId || currentFolder?.id) {
        params.append('parentFolderId', parentFolderId || currentFolder?.id || '');
      }

      const response = await apiClient.get<Folder[]>(`/documents/folders?${params}`);
      setFolders(response);

      // If we're in a folder, also fetch its documents
      if (currentFolder) {
        const folderResponse = await apiClient.get<Folder & { documents?: FolderDocument[] }>(`/documents/folders/${currentFolder.id}`);
        setDocuments(folderResponse.documents || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  }

  function navigateToFolder(folder: Folder | null) {
    if (folder) {
      setBreadcrumbs([...breadcrumbs, folder]);
    }
    setCurrentFolder(folder);
  }

  function navigateUp() {
    if (breadcrumbs.length === 0) return;
    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.pop();
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1] || null);
  }

  function navigateToBreadcrumb(index: number) {
    if (index < 0) {
      setBreadcrumbs([]);
      setCurrentFolder(null);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1] ?? null);
    }
  }

  function openCreateModal() {
    setEditingFolder(null);
    setFormData({ name: '', description: '' });
    setShowCreateModal(true);
  }

  function openEditModal(folder: Folder) {
    setEditingFolder(folder);
    setFormData({ name: folder.name, description: folder.description || '' });
    setShowCreateModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingFolder) {
        await apiClient.put(`/documents/folders/${editingFolder.id}`, formData);
      } else {
        await apiClient.post('/documents/folders', {
          ...formData,
          parentFolderId: currentFolder?.id,
        });
      }
      setShowCreateModal(false);
      fetchFolders();
    } catch (error) {
      console.error('Error saving folder:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this folder?')) return;
    try {
      await apiClient.delete(`/documents/folders/${id}`);
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Link href="/documents" className="hover:text-gray-900">Documents</Link>
            <span>/</span>
            <span>Folders</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Document Folders</h1>
          <p className="text-slate-600 mt-1">Organize your documents into folders</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FolderPlusIcon className="h-5 w-5 mr-2" />
          New Folder
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigateToBreadcrumb(-1)}
            className={`flex items-center gap-1 ${
              breadcrumbs.length === 0 ? 'text-slate-900 font-medium' : 'text-blue-600 hover:underline'
            }`}
          >
            <FolderIcon className="h-4 w-4" />
            Root
          </button>
          {breadcrumbs.map((folder, index) => (
            <span key={folder.id} className="flex items-center gap-2">
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-slate-900 font-medium'
                    : 'text-blue-600 hover:underline'
                }`}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Back Button */}
      {currentFolder && (
        <button
          onClick={navigateUp}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to {breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.name ?? 'Root' : 'Root'}
        </button>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : folders.length === 0 && documents.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {currentFolder ? 'This folder is empty' : 'No folders yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {currentFolder
                ? 'Add subfolders or documents to organize your files.'
                : 'Create folders to organize your documents.'}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FolderPlusIcon className="h-5 w-5 mr-2" />
              Create Folder
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToFolder(folder)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FolderIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{folder.name}</div>
                    {folder.description && (
                      <div className="text-sm text-gray-500">{folder.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {folder._count?.children || 0} subfolders • {folder._count?.documents || 0} documents
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(folder)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(folder.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}

            {/* Documents in Current Folder */}
            {documents.map((fd) => (
              <Link
                key={fd.id}
                href={`/documents/${fd.document.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{fd.document.name}</div>
                    <div className="text-sm text-gray-500">
                      {fd.document.documentType} • {formatFileSize(fd.document.fileSize)}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(fd.document.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              {currentFolder && (
                <div className="text-sm text-slate-500 bg-gray-50 p-3 rounded-lg">
                  Will be created in: <strong>{currentFolder.name}</strong>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
