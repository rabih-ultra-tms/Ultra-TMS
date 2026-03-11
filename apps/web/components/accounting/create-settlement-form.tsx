'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateSettlement } from '@/lib/hooks/accounting/use-settlements';

const settlementFormSchema = z.object({
  carrierId: z.string().min(1, 'Carrier ID is required'),
  notes: z.string().optional(),
});

type SettlementFormValues = z.infer<typeof settlementFormSchema>;

interface CreateSettlementFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function CreateSettlementForm({
  onSuccess,
  onCancel,
}: CreateSettlementFormProps) {
  const createSettlement = useCreateSettlement();

  const form = useForm<SettlementFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settlementFormSchema as any),
    defaultValues: {
      carrierId: '',
      notes: '',
    },
  });

  const onSubmit = async (values: SettlementFormValues) => {
    try {
      const result = await createSettlement.mutateAsync({
        carrierId: values.carrierId,
        payableIds: [],
        notes: values.notes || undefined,
      });
      toast.success('Settlement created successfully');
      onSuccess(result.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create settlement';
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="carrierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter carrier ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createSettlement.isPending}>
            {createSettlement.isPending ? 'Creating...' : 'Create Settlement'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
