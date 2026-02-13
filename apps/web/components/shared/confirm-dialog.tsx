"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// ConfirmDialog — Accessible confirmation dialog with variant support
//
// Variants:
//   default     — standard blue confirm button
//   destructive — red confirm button for delete actions
//   warning     — amber confirm button for risky-but-reversible actions
//
// Backwards compatible: `destructive` boolean prop still works.
// ---------------------------------------------------------------------------

type ConfirmVariant = "default" | "destructive" | "warning";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  /** @deprecated Use `variant="destructive"` instead */
  destructive?: boolean;
  /** Dialog variant — determines confirm button color */
  variant?: ConfirmVariant;
}

const warningButtonClass =
  "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  destructive = false,
  variant,
}: ConfirmDialogProps) {
  // Resolve variant — explicit variant wins, then legacy destructive prop
  const resolvedVariant: ConfirmVariant =
    variant ?? (destructive ? "destructive" : "default");

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isLoading) {
      onCancel();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={
                resolvedVariant === "destructive" ? "destructive" : "default"
              }
              className={cn(
                resolvedVariant === "warning" && warningButtonClass
              )}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
