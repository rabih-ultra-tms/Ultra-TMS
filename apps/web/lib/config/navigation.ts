import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  HelpCircle,
  BarChart3,
  Shield,
  Wallet,
  ClipboardList,
  UserCog,
  TrendingUp,
  ListChecks,
  Truck,
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
      title: "Operations",
      items: [
        {
          title: "Load Planner",
          href: "/load-planner/new/edit",
          icon: ClipboardList,
        },
        {
          title: "Quote History",
          href: "/quote-history",
          icon: FileText,
        },
        {
          title: "Carriers",
          href: "/carriers",
          icon: Users,
        },
        {
          title: "Load History",
          href: "/load-history",
          icon: BarChart3,
        },
        {
          title: "Truck Types",
          href: "/truck-types",
          icon: Truck,
          requiredRoles: ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER"],
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
