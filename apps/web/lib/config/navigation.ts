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
  ToggleRight,
  Package,
  ShoppingCart,
  MapPin,
  CreditCard,
  Receipt,
  DollarSign,
  PieChart,
  UserCheck,
  Banknote,
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
          title: "Operations Dashboard",
          href: "/operations",
          icon: LayoutDashboard,
        },
        {
          title: "Orders",
          href: "/operations/orders",
          icon: ShoppingCart,
        },
        {
          title: "Loads",
          href: "/operations/loads",
          icon: Package,
        },
        {
          title: "Dispatch Board",
          href: "/operations/dispatch",
          icon: ClipboardList,
        },
        {
          title: "Load Planner",
          href: "/load-planner/new/edit",
          icon: ClipboardList,
        },
        {
          title: "Quotes",
          href: "/quotes",
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
          title: "Tracking Map",
          href: "/operations/tracking",
          icon: MapPin,
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
          title: "Accounting",
          href: "/accounting",
          icon: Wallet,
        },
        {
          title: "Invoices",
          href: "/accounting/invoices",
          icon: FileText,
        },
        {
          title: "Payments",
          href: "/accounting/payments",
          icon: CreditCard,
        },
        {
          title: "Carrier Payables",
          href: "/accounting/payables",
          icon: Receipt,
        },
        {
          title: "Settlements",
          href: "/accounting/settlements",
          icon: Banknote,
        },
        {
          title: "Aging Reports",
          href: "/accounting/reports/aging",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Commissions",
      items: [
        {
          title: "Commission Dashboard",
          href: "/commissions",
          icon: DollarSign,
        },
        {
          title: "Sales Reps",
          href: "/commissions/reps",
          icon: UserCheck,
        },
        {
          title: "Plans",
          href: "/commissions/plans",
          icon: PieChart,
        },
        {
          title: "Transactions",
          href: "/commissions/transactions",
          icon: ListChecks,
        },
        {
          title: "Payouts",
          href: "/commissions/payouts",
          icon: Banknote,
        },
        {
          title: "Reports",
          href: "/commissions/reports",
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
          title: "Tenant Services",
          href: "/superadmin/tenant-services",
          icon: ToggleRight,
          requiredRoles: ["SUPER_ADMIN"],
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
      disabled: true,
    },
    {
      title: "Settings",
      href: "/profile",
      icon: Settings,
    },
  ],
};
