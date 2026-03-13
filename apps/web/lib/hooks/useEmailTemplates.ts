import { useState } from 'react';
import { MOCK_TEMPLATES, MockTemplate } from '../mocks/communications';

export interface UseEmailTemplatesReturn {
  templates: MockTemplate[];
  loading: boolean;
  createTemplate: (
    template: Omit<MockTemplate, 'id' | 'createdAt'>
  ) => Promise<MockTemplate>;
  updateTemplate: (
    id: string,
    template: Partial<MockTemplate>
  ) => Promise<MockTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  renderTemplate: (id: string, variables: Record<string, string>) => string;
}

export function useEmailTemplates(): UseEmailTemplatesReturn {
  const [templates, setTemplates] = useState<MockTemplate[]>(MOCK_TEMPLATES);
  const [loading, setLoading] = useState(false);

  const createTemplate = async (
    template: Omit<MockTemplate, 'id' | 'createdAt'>
  ): Promise<MockTemplate> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newTemplate: MockTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    setLoading(false);
    return newTemplate;
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<MockTemplate>
  ): Promise<MockTemplate> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const updated = templates.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTemplates(updated);
    setLoading(false);
    return updated.find((t) => t.id === id)!;
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setTemplates(templates.filter((t) => t.id !== id));
    setLoading(false);
  };

  const renderTemplate = (
    id: string,
    variables: Record<string, string>
  ): string => {
    const template = templates.find((t) => t.id === id);
    if (!template) return '';

    let rendered = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(`{{${key}}}`, value);
    });
    return rendered;
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
  };
}
