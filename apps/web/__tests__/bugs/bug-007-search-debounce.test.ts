/**
 * BUG-007 Regression Test: Add Missing Search Debounce
 *
 * Verifies that search inputs in carriers, quotes, and load-related pages
 * use the useDebounce hook to avoid firing API calls on every keystroke.
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

describe("BUG-007: useDebounce hook exists", () => {
  it("useDebounce is exported from lib/hooks/use-debounce.ts", () => {
    const source = readFile("lib/hooks/use-debounce.ts");
    expect(source).toContain("useDebounce");
    expect(source).toContain("export");
  });
});

describe("BUG-007: Carriers page uses debounced search", () => {
  const source = readFile("app/(dashboard)/carriers/page.tsx");

  it("imports useDebounce", () => {
    expect(source).toContain("useDebounce");
  });

  it("uses debouncedSearch variable", () => {
    expect(source).toContain("debouncedSearch");
  });

  it("passes debouncedSearch (not raw search) to query", () => {
    const lines = source.split("\n");
    const queryLines = lines.filter(
      (line) => line.includes("search:") && line.includes("debouncedSearch")
    );
    expect(queryLines.length).toBeGreaterThan(0);
  });
});

describe("BUG-007: Load history page uses debounced search", () => {
  const source = readFile("app/(dashboard)/load-history/page.tsx");

  it("imports useDebounce", () => {
    expect(source).toContain("useDebounce");
  });

  it("uses debouncedSearch variable", () => {
    expect(source).toContain("debouncedSearch");
  });

  it("passes debouncedSearch (not raw searchQuery) to query", () => {
    const lines = source.split("\n");
    const queryLines = lines.filter(
      (line) => line.includes("search:") && line.includes("debouncedSearch")
    );
    expect(queryLines.length).toBeGreaterThan(0);
  });
});

describe("BUG-007: Quote history page uses debounced search", () => {
  const source = readFile("app/(dashboard)/quote-history/page.tsx");

  it("imports useDebounce", () => {
    expect(source).toContain("useDebounce");
  });

  it("uses debouncedSearch variable", () => {
    expect(source).toContain("debouncedSearch");
  });

  it("passes debouncedSearch (not raw searchQuery) to query", () => {
    const lines = source.split("\n");
    const queryLines = lines.filter(
      (line) => line.includes("search:") && line.includes("debouncedSearch")
    );
    expect(queryLines.length).toBeGreaterThan(0);
  });
});
