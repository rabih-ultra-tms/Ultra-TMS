'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// Mock templates
const mockTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Shipment Confirmation',
    subject: 'Your shipment {{shipmentId}} has been confirmed',
    body: 'Hi {{recipientName}},\n\nYour shipment {{shipmentId}} has been confirmed for pickup on {{pickupDate}}.\n\nBest regards,\nLogistics Team',
    variables: ['shipmentId', 'recipientName', 'pickupDate'],
  },
  {
    id: 'tmpl-2',
    name: 'Delivery Notification',
    subject: 'Delivery Update: {{shipmentId}}',
    body: 'Hi {{recipientName}},\n\nYour shipment {{shipmentId}} has been delivered on {{deliveryDate}} at {{deliveryTime}}.\n\nThank you!',
    variables: ['shipmentId', 'recipientName', 'deliveryDate', 'deliveryTime'],
  },
  {
    id: 'tmpl-3',
    name: 'Invoice Email',
    subject: 'Invoice {{invoiceNumber}}',
    body: 'Hi {{companyName}},\n\nPlease find your invoice {{invoiceNumber}} attached for shipment {{shipmentId}}.\n\nTotal: {{amount}}\n\nRegards',
    variables: ['invoiceNumber', 'companyName', 'shipmentId', 'amount'],
  },
];

export default function TemplateManagerPage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'> | null>(
    null
  );

  const handleNewTemplate = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      variables: [],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (
      globalThis.confirm?.('Are you sure you want to delete this template?')
    ) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData) return;

    if (editingId) {
      // Update existing
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...formData } : t))
      );
    } else {
      // Create new
      const newTemplate: EmailTemplate = {
        id: `tmpl-${Date.now()}`,
        ...formData,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }

    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
  };

  const handleBodyChange = (text: string) => {
    if (formData) {
      const newVariables = extractVariables(text);
      setFormData({
        ...formData,
        body: text,
        variables: newVariables,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-slate-600 text-sm mt-1">
            Create and manage email templates
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {showForm && formData && (
        <div className="border rounded-lg p-6 bg-slate-50 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Template' : 'Create Template'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Order Confirmation"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject Line</label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="e.g., Your Order {{orderId}} is Confirmed"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use {'{{'} variable {'}}'} for dynamic content
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                value={formData.body}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Compose your email here..."
                rows={10}
                className="mt-2 font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use {'{{'} variable {'}}'} for dynamic content
              </p>
            </div>

            {formData.variables.length > 0 && (
              <div>
                <label className="text-sm font-medium">Variables Used</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variables.map((v) => (
                    <span
                      key={v}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono"
                    >
                      {'{{'} {v} {'}}'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-slate-50">
            <p className="text-slate-600 font-medium">No templates yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Create your first email template
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {template.subject}
                  </p>

                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.variables.map((v) => (
                        <span
                          key={v}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono"
                        >
                          {'{{'} {v} {'}}'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
