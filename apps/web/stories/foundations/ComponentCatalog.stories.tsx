import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

// ---------------------------------------------------------------------------
// Component Catalog — Overview of all TMS design system components
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Component Catalog",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>
      <div className="text-[11px] text-text-secondary mb-3">{children}</div>
    </div>
  );
}

function ComponentRow({ name, path, description }: { name: string; path: string; description: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs font-semibold text-primary min-w-[160px]">{name}</span>
      <span className="text-[10px] font-mono text-text-muted min-w-[240px]">{path}</span>
      <span className="text-[11px] text-text-secondary">{description}</span>
    </div>
  );
}

export const Catalog: Story = {
  render: () => (
    <div className="max-w-3xl">
      <h2 className="text-lg font-bold text-text-primary mb-1">Ultra TMS Design System</h2>
      <p className="text-xs text-text-secondary mb-6">
        43 component patterns extracted from dispatch v5 design. All components use the 3-layer
        token system and support light/dark themes via CSS custom properties.
      </p>

      <Section title="Foundations">
        <ComponentRow name="Design Tokens" path="globals.css + lib/design-tokens/" description="60+ CSS custom properties: brand, semantic, Tailwind registration" />
      </Section>

      <Section title="Primitives (5)">
        <ComponentRow name="StatusBadge" path="tms/primitives/status-badge" description="6 status + 4 intent variants, sm/md/lg sizes, optional dot" />
        <ComponentRow name="StatusDot" path="tms/primitives/status-dot" description="Colored indicator dot with optional pulse animation" />
        <ComponentRow name="CustomCheckbox" path="tms/primitives/custom-checkbox" description="Radix-based, sapphire checked, indeterminate support" />
        <ComponentRow name="UserAvatar" path="tms/primitives/user-avatar" description="Gradient background, initials, sm/md/lg/xl sizes" />
        <ComponentRow name="SearchInput" path="tms/primitives/search-input" description="Search icon, shortcut badge, clear button, sm/md sizes" />
      </Section>

      <Section title="Filters (4)">
        <ComponentRow name="FilterChip" path="tms/filters/filter-chip" description="Pill button with icon, label, count badge, active state" />
        <ComponentRow name="FilterBar" path="tms/filters/filter-bar" description="44px scrollable container with dividers and clear button" />
        <ComponentRow name="StatusDropdown" path="tms/filters/status-dropdown" description="Dropdown with colored dots, counts, multi-select" />
        <ComponentRow name="ColumnVisibility" path="tms/filters/column-visibility" description="Checkbox dropdown for toggling table columns" />
      </Section>

      <Section title="Stats (3)">
        <ComponentRow name="StatItem" path="tms/stats/stat-item" description="10px uppercase label + 13px bold value + trend arrow" />
        <ComponentRow name="StatsBar" path="tms/stats/stats-bar" description="40px horizontal bar container for stat items" />
        <ComponentRow name="KpiCard" path="tms/stats/kpi-card" description="Dashboard card with icon, label, value, trend, subtext" />
      </Section>

      <Section title="Tables (5)">
        <ComponentRow name="DataTable" path="tms/tables/data-table" description="TanStack Table renderer: sticky header, sort, density, selection, at-risk" />
        <ComponentRow name="GroupHeader" path="tms/tables/group-header" description="Collapsible status group with colored dot, label, count, chevron" />
        <ComponentRow name="BulkActionBar" path="tms/tables/bulk-action-bar" description="Selection count + action buttons + close, slides in" />
        <ComponentRow name="TablePagination" path="tms/tables/table-pagination" description="Page info + page buttons + ellipsis + prev/next" />
        <ComponentRow name="DensityToggle" path="tms/tables/density-toggle" description="3-way segmented: compact/default/spacious" />
      </Section>

      <Section title="Panels (3)">
        <ComponentRow name="SlidePanel" path="tms/panels/slide-panel" description="Full-height drawer: backdrop, resize 380-560px, header, animations" />
        <ComponentRow name="PanelTabs" path="tms/panels/panel-tabs" description="Tab bar with active sapphire indicator + notification badges" />
        <ComponentRow name="QuickActions" path="tms/panels/quick-actions" description="Flex row of icon+label action buttons with hover state" />
      </Section>

      <Section title="Cards (3)">
        <ComponentRow name="RouteCard" path="tms/cards/route-card" description="Origin/destination dots, connector line, dates, miles summary" />
        <ComponentRow name="InfoGrid" path="tms/cards/info-grid" description="1/2/3-column grid of bordered label/value cells" />
        <ComponentRow name="FieldList" path="tms/cards/field-list" description="Vertical label/value rows with border separators" />
      </Section>

      <Section title="Specialized (6)">
        <ComponentRow name="Timeline" path="tms/timeline/timeline" description="Vertical timeline: completed/current/pending dots with pulse" />
        <ComponentRow name="FinanceBreakdown" path="tms/finance/finance-breakdown" description="Revenue/cost sections, totals, margin box with thresholds" />
        <ComponentRow name="DocumentList" path="tms/documents/document-list" description="Status icons, doc name/status, download/upload buttons" />
        <ComponentRow name="UploadZone" path="tms/documents/upload-zone" description="Dashed border drop zone, full/inline variants, drag-over" />
        <ComponentRow name="PermitList" path="tms/documents/permit-list" description="Colored dots, expiry, status badges (active/required/expired)" />
        <ComponentRow name="AlertBanner" path="tms/alerts/alert-banner" description="4 intents: danger/warning/info/success with icon + text" />
      </Section>

      <Section title="Layout (2)">
        <ComponentRow name="AppSidebar" path="tms/layout/app-sidebar" description="64px icon-only sidebar with active indicator + notification dots" />
        <ComponentRow name="PageHeader" path="tms/layout/page-header" description="48px header: title + centered search + action buttons" />
      </Section>

      <div className="mt-8 p-4 rounded-lg bg-primary-light border border-primary-border">
        <div className="text-xs font-semibold text-primary mb-1">Customization</div>
        <div className="text-[11px] text-text-secondary">
          Change <code className="text-[10px] font-mono bg-surface px-1 py-0.5 rounded">--brand-hue: 264</code> in
          globals.css to recolor the entire app. Change <code className="text-[10px] font-mono bg-surface px-1 py-0.5 rounded">--font-sans</code> to
          swap fonts. All 31 components automatically update.
        </div>
      </div>
    </div>
  ),
};
