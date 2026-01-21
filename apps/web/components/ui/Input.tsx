import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, ...props },
    ref
  ) => {
    // Try to get error from FormField context if available
    let hasError = error;
    try {
      // Dynamic import to avoid circular dependencies
      const { useFormField } = require("@/components/ui/form");
      const fieldState = useFormField();
      hasError = hasError || !!fieldState.error;
    } catch {
      // Not in a form context, use prop
    }
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          hasError
            ? "border-destructive focus-visible:ring-destructive/20"
            : "border-input focus-visible:ring-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
