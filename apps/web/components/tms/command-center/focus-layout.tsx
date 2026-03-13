'use client';

/**
 * Focus Layout — Command Center Layout Mode
 *
 * Full-width single entity detail view for deep-dive inspection.
 * Renders the same drawer content components (Load, Carrier, Quote)
 * in a spacious full-page layout instead of a narrow slide-over drawer.
 *
 * ESC or the "Back" button returns to Board layout.
 *
 * MP-05-008
 */

import { useEffect } from 'react';
import { ArrowLeft, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadDrawerContent } from './load-drawer-content';
import { CarrierDrawerContent } from './carrier-drawer-content';
import { QuoteDrawerContent } from './quote-drawer-content';
import type { DrawerEntityType } from '@/lib/hooks/tms/use-command-center';

interface FocusLayoutProps {
  entityType: DrawerEntityType | null;
  entityId: string | null;
  onExit: () => void;
}

function EntityContent({
  entityType,
  entityId,
}: {
  entityType: DrawerEntityType;
  entityId: string;
}) {
  switch (entityType) {
    case 'load':
      return <LoadDrawerContent loadId={entityId} />;
    case 'carrier':
      return <CarrierDrawerContent carrierId={entityId} />;
    case 'quote':
      return <QuoteDrawerContent quoteId={entityId} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Unsupported entity type: {entityType}</p>
        </div>
      );
  }
}

function EmptyFocus({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <Maximize className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Focus Mode</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Select an entity from the board to view it in full-width detail.
        </p>
        <Button variant="outline" size="sm" onClick={onExit}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Board
        </Button>
      </div>
    </div>
  );
}

export function FocusLayout({ entityType, entityId, onExit }: FocusLayoutProps) {
  // ESC key exits focus mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onExit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  if (!entityType || !entityId) {
    return <EmptyFocus onExit={onExit} />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Focus header bar */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2">
        <Button variant="ghost" size="sm" onClick={onExit} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <span className="text-xs text-muted-foreground">
          Focus: {entityType} / {entityId.slice(0, 8)}...
        </span>
      </div>

      {/* Full-width entity content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6">
          <EntityContent entityType={entityType} entityId={entityId} />
        </div>
      </div>
    </div>
  );
}
