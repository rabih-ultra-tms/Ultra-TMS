"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  const [mounted, setMounted] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          "group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
          item.disabled && "pointer-events-none opacity-50",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
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
          <TooltipContent side="right">
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
                  "mb-2 flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground",
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
