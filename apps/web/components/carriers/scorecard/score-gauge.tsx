"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0–100
  size?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#6366f1"; // indigo (Platinum)
  if (score >= 75) return "#f59e0b"; // amber (Gold)
  if (score >= 60) return "#64748b"; // slate (Silver)
  if (score >= 40) return "#f97316"; // orange (Bronze)
  return "#6b7280"; // gray (Unqualified)
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Platinum";
  if (score >= 75) return "Gold";
  if (score >= 60) return "Silver";
  if (score >= 40) return "Bronze";
  return "Unqualified";
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  deg: number,
): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
): string {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function ScoreGauge({ score: rawScore, size = 180, className }: ScoreGaugeProps) {
  const score = Number.isFinite(rawScore) ? rawScore : 0;
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.075;

  const startAngle = 150;
  const totalDegrees = 240;
  const filledDegrees = (score / 100) * totalDegrees;

  const trackPath = describeArc(cx, cy, radius, startAngle, startAngle + totalDegrees);
  const fillPath =
    filledDegrees > 0
      ? describeArc(cx, cy, radius, startAngle, startAngle + filledDegrees)
      : null;

  const color = getScoreColor(score);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={trackPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {fillPath !== null && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={size * 0.22}
          fontWeight="700"
          fill={color}
        >
          {Math.round(score)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          fontSize={size * 0.085}
          fill="#94a3b8"
        >
          {getScoreLabel(score)}
        </text>
      </svg>
    </div>
  );
}
