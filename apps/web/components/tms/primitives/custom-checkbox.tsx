"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Custom Checkbox — Matches dispatch v5 design
//
// v5 spec: 14×14, 1.5px border, 3px radius, sapphire checked state.
// Built on Radix for accessibility; styled to match the design.
// ---------------------------------------------------------------------------

export interface CustomCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Show indeterminate (minus) icon instead of check */
  indeterminate?: boolean;
}

const CustomCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CustomCheckboxProps
>(({ className, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base — matches v5 .custom-check
      "peer size-3.5 shrink-0 rounded-[3px] border-[1.5px] border-border-soft",
      "flex items-center justify-center",
      "transition-all duration-150 ease-in-out",
      "cursor-pointer",
      // Hover
      "hover:border-primary",
      // Checked — sapphire background
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
      "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      {indeterminate ? (
        <Minus className="size-2.5" strokeWidth={3} />
      ) : (
        <Check className="size-2.5" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };
