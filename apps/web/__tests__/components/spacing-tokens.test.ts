/**
 * COMP-001 Regression: Spacing tokens must exist with correct structure
 *
 * Phase 1 review found spacing tokens were missing. This test ensures
 * the spacing scale and layout context presets remain intact.
 */
import { SPACING, SPACING_CONTEXTS } from "@/lib/design-tokens";
import type { SpacingToken, SpacingContext } from "@/lib/design-tokens";

describe("COMP-001: Spacing Tokens", () => {
  // ---- Spacing Scale ----

  it("exports an 8-level spacing scale", () => {
    const expectedKeys: SpacingToken[] = [
      "2xs",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
    ];
    expect(Object.keys(SPACING)).toEqual(expectedKeys);
  });

  it("all spacing values are valid rem strings", () => {
    for (const value of Object.values(SPACING)) {
      expect(value).toMatch(/^\d+(\.\d+)?rem$/);
    }
  });

  it.each([
    ["2xs", "0.25rem"],
    ["xs", "0.5rem"],
    ["sm", "0.75rem"],
    ["md", "1rem"],
    ["lg", "1.25rem"],
    ["xl", "1.5rem"],
    ["2xl", "2rem"],
    ["3xl", "3rem"],
  ] as const)("SPACING[%s] === %s", (key, expected) => {
    expect(SPACING[key]).toBe(expected);
  });

  // ---- Layout Contexts ----

  it("exports 7 layout context presets", () => {
    const expectedKeys: SpacingContext[] = [
      "pagePadding",
      "sectionGap",
      "cardGridGap",
      "cardPadding",
      "formFieldGap",
      "inlineGap",
      "filterBarPadding",
    ];
    expect(Object.keys(SPACING_CONTEXTS)).toEqual(expectedKeys);
  });

  it("all context values are Tailwind class strings", () => {
    for (const value of Object.values(SPACING_CONTEXTS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it.each([
    ["pagePadding", "p-6"],
    ["sectionGap", "space-y-6"],
    ["cardGridGap", "gap-4"],
    ["cardPadding", "p-4"],
    ["formFieldGap", "space-y-4"],
    ["inlineGap", "gap-2"],
    ["filterBarPadding", "px-5"],
  ] as const)("SPACING_CONTEXTS[%s] === %s", (key, expected) => {
    expect(SPACING_CONTEXTS[key]).toBe(expected);
  });
});
