import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  displayName: "web",
  testEnvironment: "jsdom",
  injectGlobals: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  resolver: "<rootDir>/test/jest-resolver.cjs",
  moduleNameMapper: {
    "^@/lib/hooks/operations$": "<rootDir>/test/mocks/hooks-operations.ts",
    "^@/lib/hooks/operations/(.*)$": "<rootDir>/test/mocks/hooks-operations.ts",
    "^@/lib/hooks/tms/use-orders$": "<rootDir>/test/mocks/hooks-tms-orders.ts",
    "^@/lib/hooks/tms/use-loads$": "<rootDir>/test/mocks/hooks-tms-loads.ts",
    "^@/lib/hooks/sales/use-quotes$": "<rootDir>/test/mocks/hooks-sales-quotes.ts",
    "^@/lib/hooks/tracking/use-public-tracking$": "<rootDir>/test/mocks/hooks-tracking.ts",
    "^@/lib/hooks$": "<rootDir>/test/mocks/hooks.ts",
    "^next/navigation$": "<rootDir>/test/mocks/next-navigation.ts",
    "^@/(.*)$": "<rootDir>/$1",
    "^@mswjs/interceptors/ClientRequest$":
      "<rootDir>/../../node_modules/.pnpm/@mswjs+interceptors@0.40.0/node_modules/@mswjs/interceptors/lib/node/interceptors/ClientRequest/index.js",
  },
  testMatch: ["<rootDir>/**/*.test.{ts,tsx}", "<rootDir>/**/*.spec.{ts,tsx}"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@mswjs|@bundled-es-modules)/)",
  ],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jestConfig = createJestConfig(config as any);
export default jestConfig;
