"use client";

import * as React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// AlertBanner — Inline warning/error/info/success banner
//
// v5 spec reference (doc-warning pattern generalized):
//   Container: 10px 12px padding, colored bg, 1px colored border, 6px radius
//   Layout: flex row, items-start, gap 8px
//   Icon: 16px, colored, shrink-0, mt 1px
//   Text: 11px, colored, line-height 1.4
// ---------------------------------------------------------------------------

export type AlertIntent = "danger" | "warning" | "info" | "success";

export interface AlertBannerProps {
  /** Alert intent / severity */
  intent: AlertIntent;
  /** Alert message content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const intentConfig: Record<AlertIntent, { icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
  danger: {
    icon: AlertCircle,
    bg: "bg-danger-bg",
    border: "border-danger",
    text: "text-danger",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning-bg",
    border: "border-warning",
    text: "text-warning",
  },
  info: {
    icon: Info,
    bg: "bg-info-bg",
    border: "border-info",
    text: "text-info",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-success-bg",
    border: "border-success",
    text: "text-success",
  },
};

export function AlertBanner({
  intent,
  children,
  className,
}: AlertBannerProps) {
  const config = intentConfig[intent];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2.5 rounded-md border",
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <Icon className={cn("size-4 shrink-0 mt-[1px]", config.text)} />
      <div className={cn("text-[11px] leading-[1.4]", config.text)}>
        {children}
      </div>
    </div>
  );
}
