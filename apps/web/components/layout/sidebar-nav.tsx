"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/theme-provider";
import type { NavGroup, NavItem } from "@/lib/types/navigation";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarNavProps {
  groups: NavGroup[];
  collapsed?: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ groups, collapsed = false, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  React.useEffect(() => {
    setOpenGroups(groups.map(g => g.title).filter(Boolean));
  }, [groups]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    // Exact match or sub-path match
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const linkContent = (
      <Link
        href={item.disabled ? "#" : item.href}
        onClick={onItemClick}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 no-underline hover:no-underline focus-visible:no-underline decoration-transparent hover:decoration-transparent focus:decoration-transparent focus-visible:decoration-transparent [text-decoration:none] hover:[text-decoration:none] focus:[text-decoration:none] focus-visible:[text-decoration:none]",
          !active && (isDark ? "hover:bg-slate-800/50" : "hover:bg-gray-100 hover:text-gray-900"),
          active
            ? isDark 
              ? "bg-slate-800/70 !text-gray-100 border-l-2 border-gray-600 font-semibold shadow-none"
              : "bg-gray-100 !text-gray-900 border-l-2 border-gray-200 font-semibold shadow-none"
            : isDark
              ? "!text-gray-300 hover:!text-gray-100"
              : "!text-gray-900 hover:!text-gray-900",
          item.disabled && "pointer-events-none opacity-50",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            active 
              ? isDark ? "!text-gray-100" : "!text-gray-900"
              : isDark ? "!text-gray-300 group-hover:!text-gray-100" : "!text-gray-900 group-hover:!text-gray-900"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
  };

  return (
    <nav className="flex flex-col gap-1">
      {groups.map((group, groupIndex) => {
        const isOpen = openGroups.includes(group.title) || !group.title;
        
        return (
          <div key={group.title || groupIndex} className={cn(groupIndex > 0 && "mt-2")}> 
            {!collapsed && group.title ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "flex w-full items-center justify-between mb-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 group",
                  isDark 
                    ? "text-gray-300 bg-slate-800 hover:bg-slate-700" 
                    : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                )}
              >
                <span>{group.title}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ) : null}
            
            <div className={cn(
              "flex flex-col gap-1 transition-all overflow-hidden",
              !isOpen && group.title && !collapsed ? "h-0 opacity-0" : "h-auto opacity-100"
            )}>
              {group.items.map(renderNavItem)}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
