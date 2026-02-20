/**
 * BUG-010 Regression Test: CRM Missing Features
 *
 * Verifies three CRM features:
 * 1. Owner filter is a Select dropdown (not text input for UUID)
 * 2. Pipeline drag-drop uses ConfirmDialog + toasts
 * 3. "Convert to Customer" button exists in lead detail
 *
 * These are static analysis tests since the components use hooks that
 * require complex mock setups beyond the moduleNameMapper.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, "../..");

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(WEB_ROOT, relativePath), "utf-8");
}

describe("BUG-010.1: Owner filter is a Select dropdown", () => {
  const source = readFile("app/(dashboard)/leads/page.tsx");

  it("imports Select component", () => {
    expect(source).toContain("Select");
  });

  it("imports useUsers hook for user list", () => {
    expect(source).toContain("useUsers");
  });

  it("does not use raw text input for owner filter", () => {
    // Should not have a text input with ownerId — it should be a Select
    const lines = source.split("\n");
    const textInputOwner = lines.filter(
      (line) =>
        line.includes('type="text"') &&
        (line.includes("owner") || line.includes("Owner"))
    );
    expect(textInputOwner.length).toBe(0);
  });

  it("renders owner options from user data", () => {
    // Should iterate over users to create SelectItem options
    expect(source).toContain("SelectItem");
    expect(source).toContain("firstName");
    expect(source).toContain("lastName");
  });
});

describe("BUG-010.2: Pipeline drag-drop uses ConfirmDialog", () => {
  const source = readFile("components/crm/leads/leads-pipeline.tsx");

  it("imports ConfirmDialog", () => {
    expect(source).toContain("ConfirmDialog");
  });

  it("does not use window.confirm", () => {
    expect(source).not.toContain("window.confirm");
  });

  it("uses pendingMove state for two-step confirmation", () => {
    expect(source).toContain("pendingMove");
    expect(source).toContain("setPendingMove");
  });

  it("shows toast on successful stage change", () => {
    expect(source).toContain("toast.success");
  });

  it("shows toast.error on failure", () => {
    expect(source).toContain("toast.error");
  });

  it("uses useUpdateLeadStage mutation", () => {
    expect(source).toContain("useUpdateLeadStage");
  });

  it("renders ConfirmDialog with move description", () => {
    expect(source).toContain("Move deal");
  });
});

describe("BUG-010.3: Convert to Customer button in lead detail", () => {
  const source = readFile("app/(dashboard)/leads/[id]/page.tsx");

  it("imports useConvertLead hook", () => {
    expect(source).toContain("useConvertLead");
  });

  it("has Convert to Customer button text", () => {
    expect(source).toContain("Convert");
  });

  it("imports LeadConvertDialog or has convert UI", () => {
    const hasConvertDialog = source.includes("LeadConvertDialog");
    const hasConvertAction = source.includes("convertLead");
    expect(hasConvertDialog || hasConvertAction).toBe(true);
  });
});
