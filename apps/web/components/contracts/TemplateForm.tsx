'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractTemplate, ContractType } from '@/lib/api/contracts/types';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([ContractType.CARRIER, ContractType.CUSTOMER, ContractType.VENDOR]),
  content: z.string().min(1, 'Content is required'),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template?: ContractTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TemplateFormData, isEdit: boolean) => Promise<void>;
}

/**
 * Template Create/Edit Form
 * Modal dialog for creating or editing contract templates
 */
export function TemplateForm({
  template,
  isOpen,
  onClose,
  onSubmit,
}: TemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!template;

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      type: (template?.type as any) || ContractType.CARRIER,
      content: template?.content || '',
    },
  });

  const handleSubmit = async (data: TemplateFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(data, isEdit);
      toast.success(
        isEdit ? 'Template updated successfully' : 'Template created successfully'
      );
      form.reset();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Standard Carrier Agreement"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose and key terms of this template"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Help other users understand when to use this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ContractType.CARRIER}>
                        Carrier
                      </SelectItem>
                      <SelectItem value={ContractType.CUSTOMER}>
                        Customer
                      </SelectItem>
                      <SelectItem value={ContractType.VENDOR}>Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the full contract template text here"
                      rows={12}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This content will be used as the starting point for new contracts
                    created from this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting
                  ? 'Saving...'
                  : isEdit
                    ? 'Update Template'
                    : 'Create Template'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
