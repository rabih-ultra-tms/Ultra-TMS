import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DocumentList, UploadZone, PermitList } from "@/components/tms/documents";
import { AlertBanner } from "@/components/tms/alerts";

// ---------------------------------------------------------------------------
// DocumentList stories
// ---------------------------------------------------------------------------

const docMeta: Meta<typeof DocumentList> = {
  title: "Specialized/DocumentList",
  component: DocumentList,
  decorators: [
    (Story) => (
      <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default docMeta;
type Story = StoryObj<typeof DocumentList>;

export const InTransitDocs: Story = {
  args: {
    documents: [
      { key: "bol", name: "Bill of Lading (BOL)", status: "complete", downloadable: true },
      { key: "rate", name: "Rate Confirmation", status: "complete", downloadable: true },
      { key: "pod", name: "Proof of Delivery (POD)", status: "pending", uploadable: true },
      { key: "insurance", name: "Insurance Certificate", status: "complete", downloadable: true },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    documents: [
      { key: "bol", name: "Bill of Lading (BOL)", status: "complete", downloadable: true },
      { key: "rate", name: "Rate Confirmation", status: "complete", downloadable: true },
      { key: "pod", name: "Proof of Delivery (POD)", status: "complete", downloadable: true },
      { key: "insurance", name: "Insurance Certificate", status: "complete", downloadable: true },
    ],
  },
};

export const MissingDocs: Story = {
  args: {
    documents: [
      { key: "bol", name: "Bill of Lading (BOL)", status: "missing", statusText: "Missing — required", uploadable: true },
      { key: "rate", name: "Rate Confirmation", status: "pending", uploadable: true },
      { key: "pod", name: "Proof of Delivery (POD)", status: "pending", uploadable: true },
      { key: "insurance", name: "Insurance Certificate", status: "missing", statusText: "Expired", uploadable: true },
    ],
  },
};

// ---------------------------------------------------------------------------
// UploadZone stories
// ---------------------------------------------------------------------------

export const UploadZoneFull: Story = {
  render: () => (
    <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">
        Upload Documents
      </div>
      <UploadZone variant="full" />
    </div>
  ),
};

export const UploadZoneInline: Story = {
  render: () => (
    <div className="w-[380px] p-5 bg-surface border border-border rounded-lg">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">
        Inline Upload
      </div>
      <UploadZone variant="inline" text="Drop BOL here or click" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Combined: Documents + Upload + Warning
// ---------------------------------------------------------------------------

export const FullDocumentsTab: Story = {
  render: () => (
    <div className="w-[380px] p-5 bg-surface border border-border rounded-lg space-y-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">
          Documents
        </div>
        <DocumentList
          documents={[
            { key: "bol", name: "Bill of Lading (BOL)", status: "complete", downloadable: true },
            { key: "rate", name: "Rate Confirmation", status: "complete", downloadable: true },
            { key: "pod", name: "Proof of Delivery (POD)", status: "pending", uploadable: true },
            { key: "insurance", name: "Insurance Certificate", status: "missing", statusText: "Expired — re-upload required", uploadable: true },
          ]}
        />
        <UploadZone variant="full" />
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">
          Permits
        </div>
        <PermitList
          permits={[
            { key: "oversize", name: "Oversize Permit", expiry: "Exp: Mar 15, 2026", status: "active" },
            { key: "hazmat", name: "Hazmat Endorsement", status: "required" },
            { key: "twic", name: "TWIC Card", expiry: "Exp: Jan 1, 2026", status: "expired" },
            { key: "overweight", name: "Overweight Permit", status: "na" },
          ]}
        />
      </div>

      <AlertBanner intent="danger">
        2 documents require attention. Insurance certificate has expired and POD is pending upload. Load cannot be invoiced until all documents are complete.
      </AlertBanner>
    </div>
  ),
};
