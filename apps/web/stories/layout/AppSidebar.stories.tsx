import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { AppSidebar, type SidebarNavItem } from "@/components/tms/layout";
import { PageHeader } from "@/components/tms/layout";
import { SearchInput, UserAvatar } from "@/components/tms/primitives";
import {
  Truck,
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  BarChart3,
  FileText,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// AppSidebar + PageHeader stories — full layout composition
// ---------------------------------------------------------------------------

const meta: Meta<typeof AppSidebar> = {
  title: "Layout/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

// ---- Full layout demo -----------------------------------------------------

function FullLayoutDemo() {
  const [activeNav, setActiveNav] = useState("dispatch");

  const navItems: SidebarNavItem[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", active: activeNav === "dashboard", onClick: () => setActiveNav("dashboard") },
    { key: "dispatch", icon: ClipboardList, label: "Dispatch Board", active: activeNav === "dispatch", onClick: () => setActiveNav("dispatch"), notificationDot: true },
    { key: "companies", icon: Building2, label: "Companies", active: activeNav === "companies", onClick: () => setActiveNav("companies") },
    { key: "contacts", icon: Users, label: "Contacts", active: activeNav === "contacts", onClick: () => setActiveNav("contacts") },
    { key: "loads", icon: FileText, label: "Loads", active: activeNav === "loads", onClick: () => setActiveNav("loads") },
    { key: "analytics", icon: BarChart3, label: "Analytics", active: activeNav === "analytics", onClick: () => setActiveNav("analytics") },
  ];

  const bottomItems: SidebarNavItem[] = [
    { key: "notifications", icon: Bell, label: "Notifications", notificationDot: true, onClick: () => {} },
    { key: "help", icon: HelpCircle, label: "Help", onClick: () => {} },
    { key: "settings", icon: Settings, label: "Settings", active: activeNav === "settings", onClick: () => setActiveNav("settings") },
  ];

  return (
    <div className="h-screen bg-background flex">
      <AppSidebar
        logoIcon={Truck}
        navItems={navItems}
        bottomItems={bottomItems}
        userAvatar={
          <div className="mt-2">
            <UserAvatar name="Mike Reynolds" size="sm" />
          </div>
        }
      />

      <div className="ml-16 flex-1 flex flex-col">
        <PageHeader
          title="Dispatch Board"
          center={<SearchInput placeholder="Search loads..." size="sm" />}
          actions={
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md">
                New Load
              </button>
            </div>
          }
        />

        <main className="flex-1 p-5 bg-background">
          <div className="text-sm text-text-muted text-center py-20">
            Active: <strong className="text-text-primary">{activeNav}</strong> — click sidebar icons to navigate
          </div>
        </main>
      </div>
    </div>
  );
}

export const FullLayout: Story = {
  render: () => <FullLayoutDemo />,
};

// ---- Sidebar only ---------------------------------------------------------

export const SidebarOnly: Story = {
  render: () => (
    <div className="h-screen">
      <AppSidebar
        logoIcon={Truck}
        navItems={[
          { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { key: "dispatch", icon: ClipboardList, label: "Dispatch Board", active: true, notificationDot: true },
          { key: "companies", icon: Building2, label: "Companies" },
          { key: "contacts", icon: Users, label: "Contacts" },
          { key: "loads", icon: FileText, label: "Loads" },
          { key: "analytics", icon: BarChart3, label: "Analytics" },
        ]}
        bottomItems={[
          { key: "notifications", icon: Bell, label: "Notifications", notificationDot: true },
          { key: "settings", icon: Settings, label: "Settings" },
        ]}
        userAvatar={<UserAvatar name="John Doe" size="sm" />}
      />
    </div>
  ),
};

// ---- PageHeader standalone ------------------------------------------------

export const PageHeaderStory: Story = {
  render: () => (
    <div className="w-full">
      <PageHeader
        title="Dispatch Board"
        center={<SearchInput placeholder="Search loads..." size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <button className="size-8 flex items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors">
              <Bell className="size-4" />
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md">
              New Load
            </button>
          </div>
        }
      />
      <PageHeader
        title="Companies"
        actions={
          <button className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md">
            Add Company
          </button>
        }
        className="mt-4"
      />
      <PageHeader
        title="Analytics"
        className="mt-4"
      />
    </div>
  ),
};
