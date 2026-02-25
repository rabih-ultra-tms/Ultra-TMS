"use client";

import * as React from "react";
import { Crown, Award, Medal, Shield, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarrierTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNQUALIFIED";

interface TierConfig {
  icon: React.ElementType;
  label: string;
  className: string;
}

const TIER_CONFIG: Record<CarrierTier, TierConfig> = {
  PLATINUM:   { icon: Crown,      label: "Platinum",    className: "bg-indigo-100 text-indigo-800" },
  GOLD:       { icon: Award,      label: "Gold",        className: "bg-amber-100 text-amber-800"  },
  SILVER:     { icon: Medal,      label: "Silver",      className: "bg-slate-100 text-slate-700"  },
  BRONZE:     { icon: Shield,     label: "Bronze",      className: "bg-orange-100 text-orange-800"},
  UNQUALIFIED:{ icon: CircleOff,  label: "Unqualified", className: "bg-gray-100 text-gray-700"   },
};

interface TierBadgeProps {
  tier: CarrierTier | string | null | undefined;
  size?: "sm" | "md";
  className?: string;
}

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  if (!tier) return null;

  const config = TIER_CONFIG[tier as CarrierTier];
  if (!config) return null;

  const { icon: Icon, label, className: tierClass } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        tierClass,
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
