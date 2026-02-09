"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// AppSidebar — 64px icon-only sidebar matching dispatch v5 design
//
// This is a NEW component in tms/layout/. The existing components/layout/
// app-sidebar.tsx is untouched and continues to work for the current app.
// This v5 version can be swapped in when screens adopt the new design.
//
// v5 spec reference:
//   Sidebar: fixed, 64px wide, full height, sidebar bg, right border
//   Logo: 36px, primary bg, 10px radius, centered, mb 20px
//   Nav item: 40px square, 8px radius, centered icon (20px)
//     Default: text-muted, transparent bg
//     Hover: bg-main, text-secondary
//     Active: primary-light bg, primary text, 3px left indicator bar
//   Nav dot: 8px danger circle, absolute top-right, sidebar bg border
//   Bottom section: mt-auto, same item styling
//   User avatar: at very bottom
// ---------------------------------------------------------------------------

export interface SidebarNavItem {
  /** Unique key */
  key: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Tooltip label */
  label: string;
  /** Whether this item is active */
  active?: boolean;
  /** Notification dot */
  notificationDot?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface AppSidebarProps {
  /** Logo icon component */
  logoIcon?: LucideIcon;
  /** Main navigation items */
  navItems: SidebarNavItem[];
  /** Bottom navigation items (settings, help) */
  bottomItems?: SidebarNavItem[];
  /** User avatar node (rendered at very bottom) */
  userAvatar?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

function NavItemButton({ item }: { item: SidebarNavItem }) {
  const Icon = item.icon;

  return (
    <button
      onClick={item.onClick}
      className={cn(
        "relative size-10 rounded-lg",
        "flex items-center justify-center",
        "cursor-pointer border-0",
        "transition-colors duration-150",
        // Default
        "text-text-muted bg-transparent",
        // Hover
        "hover:bg-background hover:text-text-secondary",
        // Active
        item.active && "bg-primary-light text-primary"
      )}
      title={item.label}
      aria-label={item.label}
    >
      {/* Active indicator bar */}
      {item.active && (
        <span className="absolute -left-3 top-2 w-[3px] h-6 bg-primary rounded-r" />
      )}

      <Icon className="size-5" />

      {/* Notification dot */}
      {item.notificationDot && (
        <span className="absolute top-1.5 right-1.5 size-2 bg-danger rounded-full border-2 border-sidebar" />
      )}
    </button>
  );
}

export function AppSidebar({
  logoIcon: LogoIcon,
  navItems,
  bottomItems,
  userAvatar,
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50",
        "w-16 h-screen",
        "bg-sidebar border-r border-sidebar-border",
        "flex flex-col items-center py-3",
        "shadow-[2px_0_8px_rgba(0,0,0,0.04)]",
        "transition-colors duration-200",
        className
      )}
    >
      {/* Logo */}
      {LogoIcon && (
        <div className="size-9 bg-primary rounded-[10px] flex items-center justify-center mb-5 shrink-0">
          <LogoIcon className="size-5 text-primary-foreground" />
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => (
          <NavItemButton key={item.key} item={item} />
        ))}
      </nav>

      {/* Bottom nav */}
      {(bottomItems || userAvatar) && (
        <div className="flex flex-col items-center gap-1">
          {bottomItems?.map((item) => (
            <NavItemButton key={item.key} item={item} />
          ))}
          {userAvatar}
        </div>
      )}
    </aside>
  );
}
