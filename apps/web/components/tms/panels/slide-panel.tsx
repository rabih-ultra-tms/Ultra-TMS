"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SlidePanel — Full-height slide-in drawer matching dispatch v5 design
//
// v5 spec reference:
//   Width: 420px default, resizable 380–560px via drag handle
//   Backdrop: rgba(0,0,0,0.3), click to close
//   Animation: translateX(100%) → 0, cubic-bezier(0.4, 0, 0.2, 1) 300ms
//   Header: 16px 20px padding, title 15px/700, badge, action buttons, close
//   Border-left + shadow-drawer
// ---------------------------------------------------------------------------

export interface SlidePanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Called when the panel should close */
  onClose: () => void;
  /** Panel title */
  title?: React.ReactNode;
  /** Badge element next to the title */
  badge?: React.ReactNode;
  /** Action buttons rendered in the header (left of close button) */
  headerActions?: React.ReactNode;
  /** Enable resize drag handle on left edge */
  resizable?: boolean;
  /** Default width in px */
  defaultWidth?: number;
  /** Min width when resizing */
  minWidth?: number;
  /** Max width when resizing */
  maxWidth?: number;
  /** Content below the header */
  children: React.ReactNode;
  /** Additional class on the panel */
  className?: string;
}

export function SlidePanel({
  open,
  onClose,
  title,
  badge,
  headerActions,
  resizable = true,
  defaultWidth = 420,
  minWidth = 380,
  maxWidth = 560,
  children,
  className,
}: SlidePanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(defaultWidth);

  // Reset width when panel opens
  React.useEffect(() => {
    if (open) setWidth(defaultWidth);
  }, [open, defaultWidth]);

  // ---- Resize logic -------------------------------------------------------
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = startX - ev.clientX;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        setWidth(newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width, minWidth, maxWidth]
  );

  // ---- Escape key closes ---------------------------------------------------
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 z-[95] h-screen",
          "flex flex-col",
          "bg-surface border-l border-border",
          "shadow-[var(--shadow-drawer)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        {/* Resize handle */}
        {resizable && (
          <div
            className={cn(
              "absolute left-0 top-0 w-1 h-full z-[96]",
              "cursor-col-resize",
              "transition-colors duration-150",
              "hover:bg-primary active:bg-primary"
            )}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Header */}
        {(title || badge || headerActions) && (
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              {title && (
                <span className="text-[15px] font-bold text-text-primary">
                  {title}
                </span>
              )}
              {badge}
            </div>

            <div className="flex items-center gap-1">
              {headerActions}
              <button
                onClick={onClose}
                className={cn(
                  "size-7 flex items-center justify-center",
                  "rounded-md border-0 bg-transparent",
                  "text-text-muted cursor-pointer",
                  "transition-all duration-150",
                  "hover:bg-surface-hover hover:text-text-primary"
                )}
                aria-label="Close panel"
              >
                <X className="size-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </>
  );
}
