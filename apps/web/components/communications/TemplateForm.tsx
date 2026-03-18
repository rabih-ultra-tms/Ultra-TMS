 
'use client';

import { useState } from 'react';
import type { MockTemplate } from '@/lib/mocks/communications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TemplateFormProps {
  template?: MockTemplate;
  onSubmit: (template: Omit<MockTemplate, 'id' | 'createdAt'>) => Promise<void>;
  loading?: boolean;
}

export function TemplateForm({
  template,
  onSubmit,
  loading,
}: TemplateFormProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const variables = body.match(/\{\{.*?\}\}/g) || [];
    await onSubmit({
      name,
      subject,
      body,
      variables,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Load Accepted"
          required
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Your load {{loadId}} has been accepted"
        />
      </div>

      <div>
        <Label htmlFor="body">Template Body</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Use {{variableName}} for dynamic content"
          rows={6}
          required
        />
        <p className="mt-1 text-xs text-slate-600">
          Use double curly braces for variables: {'{'}
          {'{variableName}{'}
          {'}'}
        </p>
      </div>

      <Button type="submit" disabled={loading || !name || !body}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Template'
        )}
      </Button>
    </form>
  );
}
