"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PerformanceMetricCardProps {
  title: string;
  value: number | null | undefined;
  icon: LucideIcon;
  target?: number;
  format?: "percent" | "number" | "rating";
  className?: string;
}

function formatValue(val: number, format: string): string {
  if (format === "percent") return `${val.toFixed(1)}%`;
  if (format === "rating") return `${val.toFixed(1)}/5`;
  return val.toFixed(1);
}

function getValueColor(val: number, target?: number): string {
  if (target === undefined) return "text-foreground";
  const ratio = val / target;
  if (ratio >= 1) return "text-green-600";
  if (ratio >= 0.9) return "text-amber-600";
  return "text-red-600";
}

export function PerformanceMetricCard({
  title,
  value,
  icon: Icon,
  target,
  format = "percent",
  className,
}: PerformanceMetricCardProps) {
  const displayValue =
    value != null ? formatValue(Number(value), format) : "\u2014";
  const colorClass =
    value != null
      ? getValueColor(Number(value), target)
      : "text-muted-foreground";

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {title}
            </p>
            <p className={cn("text-2xl font-bold", colorClass)}>
              {displayValue}
            </p>
            {target !== undefined && value != null && (
              <p className="text-xs text-muted-foreground">
                Target: {formatValue(target, format)}
              </p>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
