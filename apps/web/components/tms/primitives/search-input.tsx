"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Search Input — Input with search icon, keyboard shortcut badge, clear button
//
// Matches the v5 header search pattern: icon on left, ⌘K shortcut hint,
// clear button on right when text is present.
// ---------------------------------------------------------------------------

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Show keyboard shortcut badge (e.g. "⌘K") */
  shortcut?: string;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Input size */
  size?: "sm" | "md";
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      shortcut,
      value: controlledValue,
      onValueChange,
      onChange,
      size = "md",
      className,
      placeholder = "Search...",
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState("");
    const value = controlledValue ?? internalValue;
    const hasValue = value.length > 0;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setInternalValue(e.target.value);
      onValueChange?.(e.target.value);
      onChange?.(e);
    }

    function handleClear() {
      setInternalValue("");
      onValueChange?.("");
    }

    const sizeClasses =
      size === "sm"
        ? "h-7 text-[11px] pl-7 pr-7"
        : "h-8 text-xs pl-8 pr-8";

    const iconSize = size === "sm" ? "size-3.5" : "size-4";

    return (
      <div className={cn("relative inline-flex items-center", className)}>
        {/* Search icon */}
        <Search
          className={cn(
            iconSize,
            "absolute left-2 text-text-muted pointer-events-none"
          )}
        />

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            sizeClasses,
            "w-full rounded-md border border-border bg-surface",
            "text-text-primary placeholder:text-text-muted",
            "outline-none transition-colors duration-150",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          {...props}
        />

        {/* Shortcut badge or clear button */}
        <div className="absolute right-2 flex items-center">
          {hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Clear search"
            >
              <X className={iconSize} />
            </button>
          ) : (
            shortcut && (
              <kbd
                className={cn(
                  "inline-flex items-center rounded border border-border",
                  "bg-surface-filter px-1 font-mono text-text-muted",
                  size === "sm" ? "text-[9px]" : "text-[10px]"
                )}
              >
                {shortcut}
              </kbd>
            )
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
