/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description?: string;
  templateType: string;
  templateFormat: string;
  isDefault: boolean;
  isActive: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    firstName: string;
    lastName: string;
  };
}

const templateTypes = [
  { value: 'RATE_CONFIRM', label: 'Rate Confirmation' },
  { value: 'BOL', label: 'Bill of Lading' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'CARRIER_PACKET', label: 'Carrier Packet' },
  { value: 'QUOTE', label: 'Quote' },
  { value: 'STATEMENT', label: 'Statement' },
];

const templateFormats = [
  { value: 'HTML', label: 'HTML' },
  { value: 'PDF', label: 'PDF' },
  { value: 'DOCX', label: 'Word Document' },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'RATE_CONFIRM',
    templateFormat: 'HTML',
    templateContent: '',
    isDefault: false,
    language: 'en',
  });

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('templateType', filterType);

      const response = await apiClient.get<Template[]>(`/documents/templates?${params}`);
      setTemplates(response);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      templateType: 'RATE_CONFIRM',
      templateFormat: 'HTML',
      templateContent: '',
      isDefault: false,
      language: 'en',
    });
    setShowCreateModal(true);
  }

  function openEditModal(template: Template) {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      templateType: template.templateType,
      templateFormat: template.templateFormat,
      templateContent: '',
      isDefault: template.isDefault,
      language: template.language,
    });
    setShowCreateModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await apiClient.put(`/documents/templates/${editingTemplate.id}`, formData);
      } else {
        await apiClient.post('/documents/templates', formData);
      }
      setShowCreateModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiClient.delete(`/documents/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }

  async function handleSetDefault(id: string, _type: string) {
    try {
      await apiClient.put(`/documents/templates/${id}`, { isDefault: true });
      fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/documents" className="hover:text-gray-900">Documents</Link>
            <span>/</span>
            <span>Templates</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-gray-600 mt-1">Manage templates for generating documents</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Template
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            {templateTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first document template.</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentDuplicateIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  {template.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {templateTypes.find((t) => t.value === template.templateType)?.label}
                  </span>
                  <span>{template.templateFormat}</span>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <span className="text-sm text-gray-500">Updated {formatDate(template.updatedAt)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleSetDefault(template.id, template.templateType)}
                      className="p-1.5 text-gray-400 hover:text-green-600"
                      title="Set as Default"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Type *</label>
                  <select
                    value={formData.templateType}
                    onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {templateTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                  <select
                    value={formData.templateFormat}
                    onChange={(e) => setFormData({ ...formData, templateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {templateFormats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Content (HTML/Handlebars)
                </label>
                <textarea
                  value={formData.templateContent}
                  onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder="<html>&#10;  <body>&#10;    <h1>{{company.name}}</h1>&#10;    <p>Load: {{load.loadNumber}}</p>&#10;  </body>&#10;</html>"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default template for this type
                </label>
              </div>
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
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
