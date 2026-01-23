import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  requiredRoles?: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavConfig {
  mainNav: NavGroup[];
  bottomNav: NavItem[];
}
