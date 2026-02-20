/**
 * BUG-004 Regression Test: Security — JWT Tokens Logged to Console
 *
 * Verifies that admin/layout.tsx, app-sidebar.tsx, and leads-pipeline.tsx
 * do not contain console.log statements that leak JWT tokens or roles.
 *
 * This is a static analysis test — it reads the source files and checks
 * for forbidden patterns.
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

describe("BUG-004: No JWT/auth data logged to console", () => {
  describe("admin/layout.tsx", () => {
    const source = readFile("app/(dashboard)/admin/layout.tsx");

    it("has no console.log statements", () => {
      const matches = source.match(/console\.log\s*\(/g);
      expect(matches).toBeNull();
    });

    it("has no console.warn statements", () => {
      const matches = source.match(/console\.warn\s*\(/g);
      expect(matches).toBeNull();
    });

    it("has no console.debug statements", () => {
      const matches = source.match(/console\.debug\s*\(/g);
      expect(matches).toBeNull();
    });
  });

  describe("app-sidebar.tsx", () => {
    const source = readFile("components/layout/app-sidebar.tsx");

    it("has no console.log statements", () => {
      const matches = source.match(/console\.log\s*\(/g);
      expect(matches).toBeNull();
    });
  });

  describe("leads-pipeline.tsx", () => {
    const source = readFile("components/crm/leads/leads-pipeline.tsx");

    it("has no console.error statements", () => {
      const matches = source.match(/console\.error\s*\(/g);
      expect(matches).toBeNull();
    });

    it("uses toast.error for user-facing errors", () => {
      expect(source).toContain("toast.error");
    });
  });
});

describe("BUG-004: No sensitive data patterns in auth-related files", () => {
  it("admin/layout.tsx does not log token payloads", () => {
    const source = readFile("app/(dashboard)/admin/layout.tsx");
    // Should not have console.log with token/jwt/payload nearby
    const sensitivePattern = /console\.(log|debug|info)\s*\([^)]*(?:token|jwt|payload|role|auth)/gi;
    expect(source.match(sensitivePattern)).toBeNull();
  });
});
