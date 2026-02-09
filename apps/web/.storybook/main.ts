import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(ts|tsx)",
    "../stories/**/*.stories.@(ts|tsx)",
    "../stories/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen",
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../"),
    };

    // Process Tailwind CSS via PostCSS
    config.css = config.css || {};
    config.css.postcss = path.resolve(__dirname, "../");

    // Fix "React is not defined" — Next.js uses automatic JSX runtime
    // so components don't `import React`. Storybook's Vite adds
    // @vitejs/plugin-react but inherits tsconfig "jsx":"preserve"
    // which forces classic mode. Remove it and re-add with automatic.
    const react = (await import("@vitejs/plugin-react")).default;

    // Filter out Storybook's auto-added react plugins
    const isReactPlugin = (p: unknown): boolean => {
      if (!p || typeof p !== "object") return false;
      if ("name" in p) {
        const name = (p as { name: string }).name;
        return name === "vite:react-babel" || name === "vite:react-refresh";
      }
      // Could be an array of plugins
      if (Array.isArray(p)) {
        return p.some(isReactPlugin);
      }
      return false;
    };

    config.plugins = (config.plugins || []).filter((p) => !isReactPlugin(p));

    // Re-add with explicit automatic JSX runtime
    config.plugins.push(react({ jsxRuntime: "automatic" }));

    return config;
  },
};

export default config;
