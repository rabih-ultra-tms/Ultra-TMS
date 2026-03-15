'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { TemplateCard } from '@/components/contracts/TemplateCard';
import { TemplateForm } from '@/components/contracts/TemplateForm';
import { ContractTemplate } from '@/lib/api/contracts/types';
import { contractTemplatesApi } from '@/lib/api/contracts/client';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function TemplatesPageContent() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | undefined>();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractTemplatesApi.list();
      setTemplates(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (data: any, isEdit: boolean): Promise<void> => {
    // This would call an API to create/update template
    // For now, just update local state
    if (isEdit && editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? { ...editingTemplate, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      const newTemplate: ContractTemplate = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      setTemplates([newTemplate, ...templates]);
    }
    setEditingTemplate(undefined);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleEditTemplate = (template: ContractTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(undefined);
  };

  // Filter templates by search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error && !isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Templates</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage contract templates for quick contract creation
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Link href="/contracts">
          <Button variant="outline">Back to Contracts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Templates</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage contract templates for quick contract creation
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate(undefined);
            setIsFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search templates by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {templates.length === 0 ? (
              <>
                <p className="text-sm text-text-muted mb-4">No templates yet</p>
                <Button
                  onClick={() => {
                    setEditingTemplate(undefined);
                    setIsFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Template
                </Button>
              </>
            ) : (
              <p className="text-sm text-text-muted">
                No templates match your search
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onClone={fetchTemplates}
            />
          ))}
        </div>
      )}

      {/* Template Form Dialog */}
      <TemplateForm
        template={editingTemplate}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading templates...
        </div>
      }
    >
      <TemplatesPageContent />
    </Suspense>
  );
}
