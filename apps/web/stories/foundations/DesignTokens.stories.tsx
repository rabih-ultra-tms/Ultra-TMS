import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

/**
 * Design Tokens — Visual reference for the Ultra TMS design system.
 *
 * All tokens are CSS custom properties defined in globals.css.
 * Change `--brand-hue` in globals.css to rebrand the entire app.
 */

function ColorSwatch({
  name,
  cssVar,
  className,
}: {
  name: string;
  cssVar: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-md border border-border-soft ${className ?? ""}`}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <div className="text-sm font-medium text-text-primary">{name}</div>
        <div className="text-xs text-text-muted font-mono">{cssVar}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function DesignTokensPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Design Tokens
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          CSS custom properties that power the Ultra TMS design system.
        </p>
      </div>

      <Section title="Brand / Primary">
        <ColorSwatch name="Primary" cssVar="--primary" />
        <ColorSwatch name="Primary Hover" cssVar="--primary-hover" />
        <ColorSwatch name="Primary Light" cssVar="--primary-light" />
        <ColorSwatch name="Primary Border" cssVar="--primary-border" />
      </Section>

      <Section title="Surfaces">
        <ColorSwatch name="Background" cssVar="--background" />
        <ColorSwatch name="Surface" cssVar="--surface" />
        <ColorSwatch name="Surface Hover" cssVar="--surface-hover" />
        <ColorSwatch name="Surface Selected" cssVar="--surface-selected" />
        <ColorSwatch name="Surface Filter" cssVar="--surface-filter" />
        <ColorSwatch name="Card" cssVar="--card" />
      </Section>

      <Section title="Text">
        <ColorSwatch name="Text Primary" cssVar="--text-primary" />
        <ColorSwatch name="Text Secondary" cssVar="--text-secondary" />
        <ColorSwatch name="Text Muted" cssVar="--text-muted" />
      </Section>

      <Section title="Borders">
        <ColorSwatch name="Border" cssVar="--border" />
        <ColorSwatch name="Border Soft" cssVar="--border-soft" />
        <ColorSwatch name="Input" cssVar="--input" />
      </Section>

      <Section title="Status Colors">
        <ColorSwatch name="In Transit" cssVar="--status-transit" />
        <ColorSwatch
          name="In Transit BG"
          cssVar="--status-transit-bg"
        />
        <ColorSwatch name="Unassigned" cssVar="--status-unassigned" />
        <ColorSwatch
          name="Unassigned BG"
          cssVar="--status-unassigned-bg"
        />
        <ColorSwatch name="Tendered" cssVar="--status-tendered" />
        <ColorSwatch
          name="Tendered BG"
          cssVar="--status-tendered-bg"
        />
        <ColorSwatch name="Dispatched" cssVar="--status-dispatched" />
        <ColorSwatch
          name="Dispatched BG"
          cssVar="--status-dispatched-bg"
        />
        <ColorSwatch name="Delivered" cssVar="--status-delivered" />
        <ColorSwatch
          name="Delivered BG"
          cssVar="--status-delivered-bg"
        />
        <ColorSwatch name="At Risk" cssVar="--status-atrisk" />
        <ColorSwatch name="At Risk BG" cssVar="--status-atrisk-bg" />
      </Section>

      <Section title="Intent Colors">
        <ColorSwatch name="Success" cssVar="--success" />
        <ColorSwatch name="Success BG" cssVar="--success-bg" />
        <ColorSwatch name="Warning" cssVar="--warning" />
        <ColorSwatch name="Warning BG" cssVar="--warning-bg" />
        <ColorSwatch name="Danger" cssVar="--danger" />
        <ColorSwatch name="Danger BG" cssVar="--danger-bg" />
        <ColorSwatch name="Info" cssVar="--info" />
        <ColorSwatch name="Info BG" cssVar="--info-bg" />
      </Section>

      <Section title="Sidebar">
        <ColorSwatch name="Sidebar" cssVar="--sidebar" />
        <ColorSwatch name="Sidebar Foreground" cssVar="--sidebar-foreground" />
        <ColorSwatch name="Sidebar Accent" cssVar="--sidebar-accent" />
      </Section>
    </div>
  );
}

const meta: Meta = {
  title: "Foundations/Design Tokens",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj;

export const AllTokens: Story = {
  render: () => <DesignTokensPage />,
};
