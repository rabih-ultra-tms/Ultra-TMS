"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PermitList — Permits with colored dots, expiry dates, status badges
//
// v5 spec reference:
//   Item: flex row, center items, gap 10px, 8px 0 padding, border-bottom
//   Dot: 8px, rounded, colored by status
//   Info: flex-1
//     Name: 12px/500, text-primary
//     Expiry: 10px, text-muted, mt 1px
//   Badge: 10px/600, 2px 8px padding, 4px radius
//     active: success-bg, success text
//     required: warning-bg, warning text
//     expired: danger-bg, danger text
//     na: filter-bg, text-muted
// ---------------------------------------------------------------------------

export type PermitStatus = "active" | "required" | "expired" | "na";

export interface PermitItem {
  /** Unique key */
  key: string;
  /** Permit name */
  name: string;
  /** Expiry date text (e.g. "Exp: Mar 15, 2026") */
  expiry?: string;
  /** Permit status */
  status: PermitStatus;
  /** Override badge label */
  statusLabel?: string;
}

export interface PermitListProps {
  /** List of permits */
  permits: PermitItem[];
  /** Additional class names */
  className?: string;
}

const dotClass: Record<PermitStatus, string> = {
  active: "bg-success",
  required: "bg-warning",
  expired: "bg-danger",
  na: "bg-text-muted",
};

const badgeClass: Record<PermitStatus, string> = {
  active: "bg-success-bg text-success",
  required: "bg-warning-bg text-warning",
  expired: "bg-danger-bg text-danger",
  na: "bg-surface-filter text-text-muted",
};

const defaultLabel: Record<PermitStatus, string> = {
  active: "Active",
  required: "Required",
  expired: "Expired",
  na: "N/A",
};

export function PermitList({ permits, className }: PermitListProps) {
  return (
    <div className={cn("", className)}>
      {permits.map((permit, index) => (
        <div
          key={permit.key}
          className={cn(
            "flex items-center gap-2.5 py-2",
            index < permits.length - 1 && "border-b border-border"
          )}
        >
          {/* Status dot */}
          <div
            className={cn("size-2 rounded-full shrink-0", dotClass[permit.status])}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">
              {permit.name}
            </div>
            {permit.expiry && (
              <div className="text-[10px] text-text-muted mt-[1px]">
                {permit.expiry}
              </div>
            )}
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-[2px] rounded shrink-0",
              badgeClass[permit.status]
            )}
          >
            {permit.statusLabel ?? defaultLabel[permit.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
