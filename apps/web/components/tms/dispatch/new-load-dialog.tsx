'use client';

/**
 * New Load Dialog
 *
 * Full-screen dialog for creating a new load directly from the dispatch board.
 * Reuses the existing LoadFormSections + loadFormSchema + useCreateLoad hook.
 * Follows the same section visibility rules as the original load form
 * (e.g., Rate & Margin only shown when carrier is selected,
 *  Hazmat class only when isHazmat is true, temp fields only for Reefer).
 */

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  LoadFormSections,
  loadFormSchema,
  type LoadFormValues,
} from '@/components/tms/loads/load-form';
import { useCreateLoad } from '@/lib/hooks/tms/use-loads';

interface NewLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewLoadDialog({ open, onOpenChange }: NewLoadDialogProps) {
  const createLoad = useCreateLoad();

  const defaultValues = useMemo(
    (): LoadFormValues => ({
      orderId: '',
      equipmentType: '',
      commodity: '',
      weight: undefined,
      pieces: undefined,
      pallets: undefined,
      isHazmat: false,
      hazmatClass: '',
      temperatureMin: undefined,
      temperatureMax: undefined,
      stops: [
        {
          stopType: 'PICKUP',
          stopSequence: 1,
          facilityName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          appointmentRequired: false,
          appointmentDate: '',
          appointmentTimeStart: '',
          appointmentTimeEnd: '',
          specialInstructions: '',
        },
        {
          stopType: 'DELIVERY',
          stopSequence: 2,
          facilityName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          appointmentRequired: false,
          appointmentDate: '',
          appointmentTimeStart: '',
          appointmentTimeEnd: '',
          specialInstructions: '',
        },
      ],
      carrierId: '',
      driverName: '',
      driverPhone: '',
      truckNumber: '',
      trailerNumber: '',
      carrierRate: undefined,
      accessorials: [],
      fuelSurcharge: undefined,
      carrierPaymentTerms: '',
      dispatchNotes: '',
    }),
    []
  );

  // Use `as any` for zodResolver to match FormPage pattern —
  // Zod's .refine() changes the output type, causing TS mismatch
  const form = useForm<LoadFormValues>({
    resolver: zodResolver(loadFormSchema as any),
    defaultValues,
  });

  const handleSubmit = async (values: LoadFormValues) => {
    await createLoad.mutateAsync(values);
    onOpenChange(false);
    form.reset(defaultValues);
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset(defaultValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-lg border bg-background shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">New Load</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Create a new load for dispatch</DialogPrimitive.Description>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
            <div>
              <h2 className="text-lg font-semibold">New Load</h2>
              <p className="text-sm text-muted-foreground">
                Create a new load for dispatch
              </p>
            </div>
            <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Scrollable form body — LoadFormSections handles its own
              section visibility rules (carrier → rate section,
              isHazmat → hazmat class, reefer → temp fields, etc.) */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-3xl space-y-6">
                  <LoadFormSections form={form} />
                </div>
              </div>

              {/* Sticky footer */}
              <div className="flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0 bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createLoad.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoad.isPending}>
                  {createLoad.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Load
                </Button>
              </div>
            </form>
          </Form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
