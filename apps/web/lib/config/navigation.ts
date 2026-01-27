import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Package,
  FileText,
  Settings,
  HelpCircle,
  BarChart3,
  Shield,
  Wallet,
  MapPin,
  ClipboardList,
  UserCog,
  TrendingUp,
  ListChecks,
} from "lucide-react";
import type { NavConfig } from "@/lib/types/navigation";

export const navigationConfig: NavConfig = {
  mainNav: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Load Planner",
          href: "/load-planner/new/edit",
          icon: Package,
        },
        {
          title: "Quote History",
          href: "/quote-history",
          icon: FileText,
        },
        {
          title: "Load History",
          href: "/load-history",
          icon: BarChart3,
        },
        {
          title: "Carriers",
          href: "/carriers",
          icon: Truck,
        },
        {
          title: "Loads",
          href: "/loads",
          icon: Package,
        },
        {
          title: "Dispatch",
          href: "/dispatch",
          icon: MapPin,
        },
        {
          title: "Tracking",
          href: "/tracking",
          icon: Truck,
        },
      ],
    },
    {
      title: "CRM",
      items: [
        {
          title: "Companies",
          href: "/companies",
          icon: Building2,
        },
        {
          title: "Contacts",
          href: "/contacts",
          icon: Users,
        },
        {
          title: "Deals",
          href: "/leads",
          icon: TrendingUp,
        },
        {
          title: "Activities",
          href: "/activities",
          icon: ListChecks,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Carriers",
          href: "/carriers",
          icon: Truck,
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          title: "Invoices",
          href: "/invoices",
          icon: FileText,
        },
        {
          title: "Settlements",
          href: "/settlements",
          icon: Wallet,
        },
        {
          title: "Reports",
          href: "/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          title: "Users",
          href: "/admin/users",
          icon: UserCog,
          requiredRoles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          title: "Roles",
          href: "/admin/roles",
          icon: Shield,
          requiredRoles: ["ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Audit Logs",
          href: "/admin/audit-logs",
          icon: ClipboardList,
          requiredRoles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
          requiredRoles: ["ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
  ],
  bottomNav: [
    {
      title: "Help & Support",
      href: "/help",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
};
