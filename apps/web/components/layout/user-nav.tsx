"use client";
import * as React from "react";
import Link from "next/link";
import { User, Settings, Shield, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/lib/hooks/use-auth";

export function UserNav() {
  const { data: user, isLoading } = useCurrentUser();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const surfaceClass = mounted && theme === "dark" ? "bg-slate-900" : "bg-gray-50";

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "relative h-8 w-8 rounded-full border border-border shadow-sm hover:bg-accent/40",
          surfaceClass
        )}
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "relative h-8 w-8 rounded-full border border-border shadow-sm hover:bg-accent/40",
            surfaceClass
          )}
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.fullName || "User"} />
            <AvatarFallback>
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "w-64 border border-border shadow-xl drop-shadow-lg backdrop-blur-none supports-[backdrop-filter]:backdrop-blur-0",
          surfaceClass
        )}
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal bg-gray-100 dark:bg-slate-800 -mx-1 -mt-1 px-3 py-3 mb-1 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">{user?.fullName || "User"}</p>
            <p className="text-xs leading-none text-gray-600 dark:text-gray-400">{user?.email || ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
            <Link href="/profile/security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover:bg-accent hover:text-accent-foreground transition-colors">
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className={cn(
                "border border-border shadow-xl drop-shadow-lg backdrop-blur-none supports-[backdrop-filter]:backdrop-blur-0",
                surfaceClass
              )}
            >
              <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === "light" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === "dark" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                <Monitor className="mr-2 h-4 w-4" />
                System
                {theme === "system" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive cursor-pointer transition-colors" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
