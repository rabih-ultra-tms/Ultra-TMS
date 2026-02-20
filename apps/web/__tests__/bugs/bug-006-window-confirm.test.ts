/**
 * BUG-006 Regression Test: Replace window.confirm() with ConfirmDialog
 *
 * Verifies that no browser window.confirm() or bare confirm() calls remain
 * in the affected pages.
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

const FIXED_FILES = [
  "app/(dashboard)/carriers/page.tsx",
  "app/(dashboard)/load-history/page.tsx",
  "app/(dashboard)/quote-history/page.tsx",
  "app/(dashboard)/truck-types/page.tsx",
];

describe("BUG-006: No window.confirm() in fixed pages", () => {
  for (const filePath of FIXED_FILES) {
    const fileName = filePath.split("/").pop();

    describe(fileName!, () => {
      let source: string;

      beforeAll(() => {
        source = readFile(filePath);
      });

      it("does not use window.confirm()", () => {
        const matches = source.match(/window\.confirm\s*\(/g);
        expect(matches).toBeNull();
      });

      it("does not use bare confirm() calls", () => {
        // Match standalone confirm() but not ConfirmDialog, onConfirm, handleConfirm, etc.
        const lines = source.split("\n");
        const bareConfirmLines = lines.filter((line) => {
          // Skip comments
          if (line.trim().startsWith("//") || line.trim().startsWith("*")) return false;
          // Skip import lines
          if (line.trim().startsWith("import")) return false;
          // Match bare confirm( but not *Confirm* (like ConfirmDialog, onConfirm, handleConfirm)
          return /(?<![a-zA-Z])confirm\s*\(/.test(line) && !/[a-zA-Z]confirm/i.test(line);
        });

        expect(bareConfirmLines).toEqual([]);
      });
    });
  }
});

describe("BUG-006: ConfirmDialog component exists", () => {
  it("confirm-dialog.tsx exists in shared components", () => {
    const filePath = path.join(WEB_ROOT, "components/shared/confirm-dialog.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("exports ConfirmDialog with destructive variant support", () => {
    const source = readFile("components/shared/confirm-dialog.tsx");
    expect(source).toContain("export function ConfirmDialog");
    expect(source).toContain("destructive");
    expect(source).toContain("isLoading");
  });
});
