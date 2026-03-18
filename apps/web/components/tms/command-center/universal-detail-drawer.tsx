'use client';

/**
 * Universal Detail Drawer (Polymorphic)
 *
 * Slide-out drawer shell that renders entity-specific content based on type.
 * Used by Command Center to show load, quote, carrier, order, or alert details.
 *
 * For loads: delegates to the existing DispatchDetailDrawer (PROTECTED, 1,535 LOC).
 * For other entity types: renders inline panels.
 *
 * MP-05-004
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DrawerEntityType } from '@/lib/hooks/tms/use-command-center';

interface UniversalDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  entityType: DrawerEntityType | null;
  entityId: string | null;
  /**
   * Title shown in the drawer header.
   * Falls back to "{entityType} Detail" if not provided.
   */
  title?: string;
  children?: React.ReactNode;
}

export function UniversalDetailDrawer({
  open,
  onClose,
  entityType,
  entityId,
  title,
  children,
}: UniversalDetailDrawerProps) {
   
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  // Focus management: trap focus inside drawer when open
  React.useEffect(() => {
    if (open) {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElement.current = document.activeElement;
      }
      // Small delay so the drawer transition starts before focus moves
      const timer = setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [open]);

  // Escape key handler
  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleBackdropClick = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const displayTitle =
    title ??
    (entityType
      ? `${entityType.charAt(0).toUpperCase()}${entityType.slice(1)} Detail`
      : 'Detail');

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/25 transition-opacity duration-300',
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={displayTitle}
        tabIndex={-1}
        className={cn(
          'fixed inset-y-0 right-0 z-[51] flex w-[45vw] min-w-[400px] max-w-[700px] flex-col bg-background shadow-xl',
          'transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)]',
          'focus:outline-none',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {entityType && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                {entityType}
              </span>
            )}
            <h2 className="truncate text-sm font-semibold">{displayTitle}</h2>
            {entityId && (
              <span className="text-xs text-muted-foreground">
                #{entityId.slice(0, 8)}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content area — renders entity-specific content via children */}
        <div className="flex-1 overflow-y-auto">
          {children ?? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {entityType
                  ? `Select a ${entityType} to view details`
                  : 'No entity selected'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
