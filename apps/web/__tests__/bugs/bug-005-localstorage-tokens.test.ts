/**
 * BUG-005 Regression Test: Security — HttpOnly Cookie Auth
 *
 * Verifies that client.ts does not use localStorage or document.cookie
 * for storing JWT tokens. The auth flow uses HttpOnly cookies set by the backend.
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

describe("BUG-005: No client-side token storage in client.ts", () => {
  const source = readFile("lib/api/client.ts");

  it("does not use localStorage for tokens", () => {
    expect(source).not.toMatch(/localStorage\.(getItem|setItem|removeItem)\s*\(/);
  });

  it("does not read tokens from document.cookie", () => {
    // The file should not contain document.cookie reads for auth tokens
    expect(source).not.toMatch(/document\.cookie/);
  });

  it("does not manually set Authorization headers from stored tokens", () => {
    // No getClientAccessToken or manual Bearer header injection
    expect(source).not.toContain("getClientAccessToken");
    expect(source).not.toMatch(/Authorization.*Bearer.*getClient/);
  });

  it("documents HttpOnly cookie strategy", () => {
    expect(source).toContain("HttpOnly cookies");
    expect(source).toContain("XSS-safe");
  });

  it("uses credentials: include for automatic cookie sending", () => {
    expect(source).toContain('credentials: "include"');
  });

  it("setAuthTokens is a no-op", () => {
    expect(source).toContain("export function setAuthTokens");
    expect(source).toMatch(/setAuthTokens.*No-op/s);
  });

  it("clearAuthTokens is a no-op", () => {
    expect(source).toContain("export function clearAuthTokens");
    expect(source).toMatch(/clearAuthTokens.*No-op/s);
  });
});

describe("BUG-005: No client-side token storage in use-auth.ts", () => {
  const source = readFile("lib/hooks/use-auth.ts");

  it("does not reference localStorage at all", () => {
    expect(source).not.toContain("localStorage");
  });

  it("does not import setAuthTokens or clearAuthTokens", () => {
    expect(source).not.toContain("setAuthTokens");
    expect(source).not.toContain("clearAuthTokens");
  });
});

describe("BUG-005: No client-side token storage in login pages", () => {
  it("login page does not import setAuthTokens", () => {
    const source = readFile("app/(auth)/login/page.tsx");
    expect(source).not.toContain("setAuthTokens");
  });

  it("superadmin login page does not import setAuthTokens", () => {
    const source = readFile("app/(auth)/superadmin/login/page.tsx");
    expect(source).not.toContain("setAuthTokens");
  });
});
