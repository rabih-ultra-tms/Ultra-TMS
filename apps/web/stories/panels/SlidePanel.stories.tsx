import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import {
  SlidePanel,
  PanelTabs,
  QuickActions,
  type PanelTab,
  type QuickAction,
} from "@/components/tms/panels";
import { RouteCard, InfoGrid, FieldList } from "@/components/tms/cards";
import { StatusBadge } from "@/components/tms/primitives";
import {
  Phone,
  Mail,
  MessageSquare,
  Pencil,
  MapPin,
  Star,
  Flag,
} from "lucide-react";

// ---------------------------------------------------------------------------
// SlidePanel stories — demonstrates the full drawer pattern from v5
// ---------------------------------------------------------------------------

const meta: Meta<typeof SlidePanel> = {
  title: "Panels/SlidePanel",
  component: SlidePanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SlidePanel>;

// ---- Mock data ------------------------------------------------------------

const TABS: PanelTab[] = [
  { key: "overview", label: "Overview" },
  { key: "carrier", label: "Carrier", badge: "warning" },
  { key: "timeline", label: "Timeline" },
  { key: "finance", label: "Finance" },
  { key: "documents", label: "Documents", badge: "danger" },
];

const QUICK_ACTIONS: QuickAction[] = [
  { key: "call", icon: Phone, label: "Call" },
  { key: "email", icon: Mail, label: "Email" },
  { key: "message", icon: MessageSquare, label: "Message" },
  { key: "edit", icon: Pencil, label: "Edit" },
  { key: "track", icon: MapPin, label: "Track" },
];

// ---- Full Drawer (v5 Overview Tab) ----------------------------------------

function FullDrawerDemo() {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="h-screen bg-background p-8">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
      >
        Open Drawer
      </button>

      <SlidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="LD-1001"
        badge={<StatusBadge status="transit" size="sm">In Transit</StatusBadge>}
        headerActions={
          <>
            <button className="size-7 flex items-center justify-center rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
              <Star className="size-4" />
            </button>
            <button className="size-7 flex items-center justify-center rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
              <Flag className="size-4" />
            </button>
          </>
        }
      >
        <PanelTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 overflow-y-auto p-5 thin-scrollbar">
          {activeTab === "overview" && (
            <>
              {/* Section: Quick Actions */}
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5">
                Quick Actions
              </div>
              <QuickActions actions={QUICK_ACTIONS} />

              {/* Section: Route */}
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5">
                Route
              </div>
              <RouteCard
                origin={{
                  city: "Chicago, IL",
                  dateTime: "Feb 10, 2026 at 08:00 AM",
                }}
                destination={{
                  city: "Dallas, TX",
                  dateTime: "Feb 12, 2026 at 02:00 PM",
                }}
                summary="920 miles · ~17h drive · $2.72/mi"
              />

              {/* Section: Equipment */}
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5 mt-4">
                Equipment
              </div>
              <InfoGrid
                cells={[
                  { key: "type", label: "Type", value: "Dry Van" },
                  { key: "temp", label: "Temp Control", value: "N/A" },
                  { key: "weight", label: "Weight", value: "42,000 lbs", subText: "Full load" },
                  { key: "dims", label: "Dimensions", value: "53' standard" },
                ]}
              />

              {/* Section: Customer */}
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5 mt-4">
                Customer
              </div>
              <FieldList
                fields={[
                  { key: "company", label: "Company", value: "Acme Supply Co." },
                  { key: "contact", label: "Contact", value: "Operations Dept." },
                  { key: "po", label: "PO #", value: "PO-1001-A" },
                ]}
              />
            </>
          )}

          {activeTab !== "overview" && (
            <div className="text-sm text-text-muted text-center py-12">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab content
            </div>
          )}
        </div>
      </SlidePanel>
    </div>
  );
}

export const FullDrawer: Story = {
  render: () => <FullDrawerDemo />,
};

// ---- PanelTabs standalone -------------------------------------------------

function PanelTabsDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  return (
    <div className="w-[420px] bg-surface border border-border rounded-lg overflow-hidden">
      <PanelTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-5 text-sm text-text-secondary">
        Active tab: <strong>{activeTab}</strong>
      </div>
    </div>
  );
}

export const TabsStandalone: Story = {
  render: () => <PanelTabsDemo />,
};

// ---- QuickActions standalone ----------------------------------------------

export const QuickActionsStory: Story = {
  render: () => (
    <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5">
        Quick Actions
      </div>
      <QuickActions
        actions={QUICK_ACTIONS}
      />
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5">
        With Disabled
      </div>
      <QuickActions
        actions={[
          { key: "call", icon: Phone, label: "Call" },
          { key: "email", icon: Mail, label: "Email", disabled: true },
          { key: "track", icon: MapPin, label: "Track" },
        ]}
      />
    </div>
  ),
};
