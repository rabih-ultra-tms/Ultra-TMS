import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "rounded-full px-2.5 py-0.5 text-xs text-foreground",
        // Priority variants (v5 design: 10px font, 4px radius, 2px 6px padding)
        "priority-urgent": "rounded-[4px] px-1.5 py-[2px] text-[10px] border-transparent bg-danger-bg text-danger",
        "priority-high": "rounded-[4px] px-1.5 py-[2px] text-[10px] border-transparent bg-warning-bg text-warning",
        "priority-normal": "rounded-[4px] px-1.5 py-[2px] text-[10px] border-transparent bg-surface-filter text-text-secondary",
        "priority-low": "rounded-[4px] px-1.5 py-[2px] text-[10px] border-transparent bg-surface-filter text-text-muted",
        // Equipment badge (v5 .equip-badge: 10px, 4px radius, border)
        equipment: "rounded-[4px] px-2 py-[2px] text-[10px] bg-surface-filter border-border text-text-secondary",
        // Mode badge (v5 .mode-badge: same as equipment)
        mode: "rounded-[4px] px-1.5 py-[2px] text-[10px] bg-surface-filter border-border text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
