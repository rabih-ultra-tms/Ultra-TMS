'use client';

/**
 * New Quote Dialog
 *
 * Full-screen dialog that directly renders the Load Planner page component
 * in "new" mode. Uses the embeddedId / onSaveSuccess / onCancel props added
 * to LoadPlannerEditPage so it works inside a dialog without navigation.
 */

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const LoadPlannerEditPage = dynamic(
  () => import('@/app/(dashboard)/load-planner/[id]/edit/page'),
  { ssr: false }
);

interface NewQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewQuoteDialog({ open, onOpenChange }: NewQuoteDialogProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed inset-4 z-50 flex flex-col rounded-lg border bg-background shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">New Quote</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Create a new quote using the load planner
          </DialogPrimitive.Description>

          {/* Load Planner rendered directly */}
          <div className="flex-1 overflow-y-auto">
            {open && (
              <LoadPlannerEditPage
                embeddedId="new"
                onSaveSuccess={handleClose}
                onCancel={handleClose}
              />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
