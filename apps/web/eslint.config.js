import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["storybook-static/**"],
  },
  ...nextJsConfig,
  {
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
