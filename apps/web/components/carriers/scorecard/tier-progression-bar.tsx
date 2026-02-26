"use client";

import * as React from "react";
import { Crown, Award, Medal, Shield, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tier {
  label: string;
  min: number;
  color: string;
  icon: React.ElementType;
}

const TIERS: Tier[] = [
  { label: "Unqualified", min: 0,  color: "bg-gray-400",   icon: CircleOff },
  { label: "Bronze",      min: 40, color: "bg-orange-400", icon: Shield    },
  { label: "Silver",      min: 60, color: "bg-slate-400",  icon: Medal     },
  { label: "Gold",        min: 75, color: "bg-amber-400",  icon: Award     },
  { label: "Platinum",    min: 90, color: "bg-indigo-500", icon: Crown     },
];

function getCurrentTierIndex(score: number): number {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= (TIERS[i]?.min ?? 0)) return i;
  }
  return 0;
}

interface TierProgressionBarProps {
  score: number;
}

export function TierProgressionBar({ score }: TierProgressionBarProps) {
  const currentIdx = getCurrentTierIndex(score);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Tier Progression
      </p>
      <div className="flex items-center gap-1">
        {TIERS.map((tier, idx) => {
          const Icon = tier.icon;
          const isActive = idx === currentIdx;
          const isPast = idx < currentIdx;
          return (
            <React.Fragment key={tier.label}>
              {idx > 0 && (
                <div
                  className={cn(
                    "flex-1 h-1 rounded-full",
                    isPast ? tier.color : "bg-muted",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex flex-col items-center gap-1",
                  isActive
                    ? "opacity-100"
                    : isPast
                      ? "opacity-60"
                      : "opacity-30",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive || isPast ? tier.color : "bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">
                  {tier.label}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {tier.min}+
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
