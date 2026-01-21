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
      title: "Management",
      items: [
        {
          title: "Customers",
          href: "/customers",
          icon: Building2,
        },
        {
          title: "Leads",
          href: "/leads",
          icon: TrendingUp,
        },
        {
          title: "Contacts",
          href: "/contacts",
          icon: Users,
        },
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
      title: "Administration",
      items: [
        {
          title: "Users",
          href: "/admin/users",
          icon: UserCog,
        },
        {
          title: "Roles",
          href: "/admin/roles",
          icon: Shield,
        },
        {
          title: "Audit Logs",
          href: "/admin/audit-logs",
          icon: ClipboardList,
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
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
