"use client";
import * as React from "react";
import Link from "next/link";
import { PanelLeft, Bell, Search, Wifi, WifiOff, CheckCheck, AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserNav } from "./user-nav";
import { useUIStore } from "@/lib/stores/ui-store";
import { useSocketStatus } from "@/lib/socket";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle2,
} as const;

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const { toggleSidebar, toggleSidebarCollapsed } = useUIStore();
  const [mounted, setMounted] = React.useState(false);
  const { status, connected, latency } = useSocketStatus();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden shrink-0 md:flex"
        onClick={toggleSidebarCollapsed}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1">
        <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full max-w-sm pl-8"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {mounted && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
                  {connected ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <Wifi className="h-3.5 w-3.5" />
                    </>
                  ) : status === 'reconnecting' ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                      <Wifi className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <WifiOff className="h-3.5 w-3.5" />
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">
                    {connected ? 'Real-time Connected' : status === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
                  </p>
                  {latency !== null && connected && (
                    <p className="text-xs text-muted-foreground">Latency: {latency}ms</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2">
                <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs text-muted-foreground"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => {
                    const Icon = NOTIFICATION_ICONS[n.type] ?? Info;
                    return (
                      <button
                        key={n.id}
                        className={cn(
                          "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                          !n.read && "bg-muted/30"
                        )}
                        onClick={() => markAsRead(n.id)}
                      >
                        <Icon
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            n.type === "warning" && "text-yellow-500",
                            n.type === "error" && "text-destructive",
                            n.type === "success" && "text-green-500",
                            n.type === "info" && "text-blue-500"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/70">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        <UserNav />
      </div>
    </header>
  );
}
