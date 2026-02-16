"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { useUIStore } from "@/lib/stores/ui-store";
import { SocketProvider } from "@/lib/socket/socket-provider";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <SocketProvider>
      <div className="relative isolate min-h-screen bg-background">
        <AppSidebar />
        <div
          className={cn(
            "flex flex-col transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
}
