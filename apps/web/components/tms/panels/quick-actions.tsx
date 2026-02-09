"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// QuickActions — Grid of icon + label action buttons for the SlidePanel
//
// v5 spec reference:
//   Container: flex row, gap 8px, mb 20px
//   Button: flex-1, flex-col, center, gap 4px, 10px 4px padding
//           bg-filter, 1px border, 8px radius
//   Hover: sapphire border, sapphire-light bg, sapphire icon+label
//   Icon: 18px, text-secondary → sapphire on hover
//   Label: 9px/500, text-muted → sapphire on hover
// ---------------------------------------------------------------------------

export interface QuickAction {
  /** Unique key */
  key: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Button label */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export interface QuickActionsProps {
  /** List of actions to render */
  actions: QuickAction[];
  /** Additional class names */
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn("flex gap-2 mb-5", className)}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "flex-1 flex flex-col items-center gap-1",
              "py-2.5 px-1",
              "bg-surface-filter border border-border rounded-lg",
              "cursor-pointer",
              "transition-all duration-150",
              // Hover
              "hover:border-primary hover:bg-primary-light",
              "hover:[&_svg]:text-primary",
              "hover:[&_.quick-action-label]:text-primary",
              // Disabled
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-surface-filter"
            )}
          >
            <Icon className="size-[18px] text-text-secondary transition-colors duration-150" />
            <span className="quick-action-label text-[9px] font-medium text-text-muted transition-colors duration-150">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
