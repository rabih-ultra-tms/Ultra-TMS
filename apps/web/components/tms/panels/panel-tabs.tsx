"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PanelTabs — Tab bar for the SlidePanel matching dispatch v5 design
//
// v5 spec reference:
//   Container: 0 20px padding, border-bottom, surface bg
//   Tabs: 12px/500, 10px 14px padding, transparent border-bottom 2px
//   Active: sapphire text, 600 weight, sapphire border-bottom
//   Notification badges: 6px dot, absolute top-right, danger/warning colors
// ---------------------------------------------------------------------------

export interface PanelTab {
  /** Unique key for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional notification badge type */
  badge?: "danger" | "warning" | null;
}

export interface PanelTabsProps {
  /** Tab definitions */
  tabs: PanelTab[];
  /** Currently active tab key */
  activeTab: string;
  /** Called when a tab is clicked */
  onTabChange: (key: string) => void;
  /** Additional class names */
  className?: string;
}

export function PanelTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: PanelTabsProps) {
  return (
    <div
      className={cn(
        "flex px-5 border-b border-border shrink-0 bg-surface",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "relative px-3.5 py-2.5",
              "border-0 bg-transparent",
              "text-xs font-medium",
              "cursor-pointer whitespace-nowrap",
              "border-b-2 border-b-transparent",
              "transition-all duration-150",
              // Default state
              "text-text-muted hover:text-text-secondary",
              // Active state
              isActive && "text-primary font-semibold !border-b-primary"
            )}
          >
            {tab.label}

            {/* Notification badge dot */}
            {tab.badge && (
              <span
                className={cn(
                  "absolute top-1.5 right-1 size-1.5 rounded-full",
                  tab.badge === "danger" && "bg-danger",
                  tab.badge === "warning" && "bg-warning"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
