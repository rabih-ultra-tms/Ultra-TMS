/**
 * Custom Jest resolver that intercepts specific module paths
 * and redirects them to test mocks.
 *
 * This is needed because next/jest's SWC transform resolves @/ path aliases
 * BEFORE moduleNameMapper gets a chance to intercept them.
 */

const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Map resolved module paths to mock files
const MOCK_MAP = {
  // Normalize to forward slashes for comparison
  "lib/hooks/operations": path.join(ROOT, "test/mocks/hooks-operations.ts"),
  "lib/hooks/tms/use-orders": path.join(ROOT, "test/mocks/hooks-tms-orders.ts"),
  "lib/hooks/tms/use-loads": path.join(ROOT, "test/mocks/hooks-tms-loads.ts"),
  "lib/hooks/sales/use-quotes": path.join(ROOT, "test/mocks/hooks-sales-quotes.ts"),
  "lib/hooks/tracking/use-public-tracking": path.join(ROOT, "test/mocks/hooks-tracking.ts"),
  "lib/hooks/index": path.join(ROOT, "test/mocks/hooks.ts"),
  "lib/hooks": path.join(ROOT, "test/mocks/hooks.ts"),
};

module.exports = (modulePath, options) => {
  // Use Jest's default resolver first
  const defaultResolver =
    options.defaultResolver || require("jest-resolve/build/defaultResolver").default;

  try {
    const resolved = defaultResolver(modulePath, options);

    // Check if the resolved path matches any of our mock targets
    const normalized = resolved.replace(/\\/g, "/");
    for (const [target, mock] of Object.entries(MOCK_MAP)) {
      if (
        normalized.includes(`/${target}.ts`) ||
        normalized.includes(`/${target}/index.ts`) ||
        normalized.endsWith(`/${target}`)
      ) {
        return mock;
      }
    }

    return resolved;
  } catch (err) {
    // If default resolution fails, re-throw
    throw err;
  }
};
