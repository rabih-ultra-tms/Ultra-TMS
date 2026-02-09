"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// User Avatar — Gradient circle with initials
//
// v5 spec: 28px, border-radius 50%, gradient(135deg, #7C3AED → #3B82F6),
//          11px/600 white text, flex-centered initials.
// ---------------------------------------------------------------------------

const sizeMap = {
  sm: "size-6 text-[9px]", // 24px
  md: "size-7 text-[11px]", // 28px — v5 default
  lg: "size-9 text-xs", // 36px
  xl: "size-11 text-sm", // 44px
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "?";
  if (parts.length === 1) return (first[0] ?? "?").toUpperCase();
  return ((first[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
}

export interface UserAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — initials are derived from first & last */
  name: string;
  /** Optional image URL — if provided, shows image instead of initials */
  src?: string;
  /** Avatar size */
  size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({
  name,
  src,
  size = "md",
  className,
  ...props
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0",
        "bg-gradient-to-br from-[#7C3AED] to-[#3B82F6]",
        "font-semibold text-white select-none cursor-pointer",
        "overflow-hidden",
        sizeMap[size],
        className
      )}
      title={name}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
