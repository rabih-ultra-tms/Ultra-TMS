import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "storybook-static/**",
      "components/load-planner/**",
      "app/**/load-planner/**",
      "lib/load-planner/**",
      "lib/pdf/**",
      "test/jest-resolver.cjs",
    ],
  },
  ...nextJsConfig,
  {
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["__tests__/**", "test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
