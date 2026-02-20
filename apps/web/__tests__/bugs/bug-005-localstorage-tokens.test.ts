/**
 * BUG-005 Regression Test: Security — localStorage Token Storage
 *
 * Verifies that client.ts does not use localStorage for storing JWT tokens.
 * The auth flow should use httpOnly cookies only.
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

describe("BUG-005: No localStorage token storage in client.ts", () => {
  const source = readFile("lib/api/client.ts");

  it("does not use localStorage.getItem for tokens", () => {
    const matches = source.match(/localStorage\.getItem\s*\(/g);
    expect(matches).toBeNull();
  });

  it("does not use localStorage.setItem for tokens", () => {
    const matches = source.match(/localStorage\.setItem\s*\(/g);
    expect(matches).toBeNull();
  });

  it("does not use localStorage.removeItem for tokens", () => {
    const matches = source.match(/localStorage\.removeItem\s*\(/g);
    expect(matches).toBeNull();
  });

  it("documents XSS-safe cookie-only policy", () => {
    expect(source).toContain("NO localStorage usage (XSS-safe)");
  });

  it("uses readCookie for getting access tokens", () => {
    expect(source).toContain("readCookie");
  });

  it("uses writeCookie for storing tokens", () => {
    expect(source).toContain("writeCookie");
  });

  it("uses deleteCookie for clearing tokens", () => {
    expect(source).toContain("deleteCookie");
  });
});

describe("BUG-005: No localStorage token storage in use-auth.ts", () => {
  const source = readFile("lib/hooks/use-auth.ts");

  it("does not reference localStorage at all", () => {
    expect(source).not.toContain("localStorage");
  });

  it("calls clearAuthTokens on logout", () => {
    expect(source).toContain("clearAuthTokens");
  });
});
