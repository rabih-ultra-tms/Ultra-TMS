"use client";
import Link from "next/link";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNav } from "./sidebar-nav";
import { navigationConfig } from "@/lib/config/navigation";
import { useUIStore } from "@/lib/stores/ui-store";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-lg font-bold">Ultra TMS</span>}
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarNav groups={navigationConfig.mainNav} collapsed={sidebarCollapsed} />
        </ScrollArea>

        <div className="mt-auto border-t p-3">
          <SidebarNav
            groups={[{ title: "", items: navigationConfig.bottomNav }]}
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
          "hidden border-r bg-background md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:flex-col",
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:w-16" : "md:w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Truck className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Ultra TMS</span>
              </Link>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <SidebarNav groups={navigationConfig.mainNav} onItemClick={() => setSidebarOpen(false)} />
            </ScrollArea>

            <div className="mt-auto border-t p-3">
              <SidebarNav
                groups={[{ title: "", items: navigationConfig.bottomNav }]}
                onItemClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
