import type { Preview } from "@storybook/react";
import React from "react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#F8F9FA" },
        { name: "dark", value: "#1E1E1E" },
      ],
    },
    layout: "centered",
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals?.backgrounds?.value === "#1E1E1E";
      return (
        <div className={isDark ? "dark" : ""}>
          <div className="bg-background text-foreground p-4">
            <Story />
          </div>
        </div>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Toggle light/dark mode",
      defaultValue: "light",
      toolbar: {
        icon: "sun",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
