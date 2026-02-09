"use client";
import * as React from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNav } from "./sidebar-nav";
import { navigationConfig } from "@/lib/config/navigation";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/hooks/use-auth";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const { data: currentUser } = useCurrentUser();

  const userRoles = React.useMemo(() => {
    const rolesFromArray = currentUser?.roles?.map((role) => role.name) ?? [];
    const singleRole = (currentUser as { role?: { name?: string } })?.role?.name;
    const normalize = (role: string) => role.replace(/-/g, "_").toUpperCase();
    const collected = [...rolesFromArray, ...(singleRole ? [singleRole] : [])];
    const normalized = Array.from(new Set(collected.filter(Boolean).map(normalize)));
    return normalized;
  }, [currentUser]);

  const canSeeItem = React.useCallback(
    (requiredRoles?: string[]) => {
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
      const normalized = requiredRoles.map((role) => role.replace(/-/g, "_").toUpperCase());
      return userRoles.some((role) => normalized.includes(role));
    },
    [userRoles]
  );

  const filteredMainNav = React.useMemo(() =>
    navigationConfig.mainNav
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canSeeItem(item.requiredRoles)),
      }))
      .filter((group) => group.items.length > 0),
  [canSeeItem]);

  const filteredBottomNav = React.useMemo(
    () => navigationConfig.bottomNav.filter((item) => canSeeItem(item.requiredRoles)),
    [canSeeItem]
  );

  const sidebarContent = (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-14 items-center border-b px-4",
            sidebarCollapsed ? "justify-center px-2" : "gap-2"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && <span className="text-lg font-bold tracking-tight text-foreground">Ultra TMS</span>}
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarNav groups={filteredMainNav} collapsed={sidebarCollapsed} />
        </ScrollArea>

        <div className="mt-auto border-t p-3">
          <SidebarNav
            groups={[{ title: "", items: filteredBottomNav }]}
            collapsed={sidebarCollapsed}
          />
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden border-r bg-background text-foreground md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col",
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:w-16" : "md:w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-background text-foreground">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">Ultra TMS</span>
              </Link>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <SidebarNav groups={filteredMainNav} onItemClick={() => setSidebarOpen(false)} />
            </ScrollArea>

            <div className="mt-auto border-t p-3">
              <SidebarNav
                groups={[{ title: "", items: filteredBottomNav }]}
                onItemClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
