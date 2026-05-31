// /src/utils/group-colors.test.ts

import { describe, it, expect } from "vitest";

import { groupIndexToColor, groupIndexToColorDark } from "@/utils/group-colors";

describe("group-colors", () => {
  it("returns an oklch color string for light mode", () => {
    const color = groupIndexToColor(0);
    expect(color).toMatch(/^oklch\(/);
    expect(color).toContain("88%");
  });

  it("returns an oklch color string for dark mode", () => {
    const color = groupIndexToColorDark(0);
    expect(color).toMatch(/^oklch\(/);
    expect(color).toContain("30%");
  });

  it("returns different colors for different indices", () => {
    const color0 = groupIndexToColor(0);
    const color1 = groupIndexToColor(1);
    expect(color0).not.toBe(color1);
  });

  it("wraps around after 12 indices", () => {
    const color0 = groupIndexToColor(0);
    const color12 = groupIndexToColor(12);
    expect(color0).toBe(color12);
  });

  it("light and dark versions differ for same index", () => {
    const light = groupIndexToColor(0);
    const dark = groupIndexToColorDark(0);
    expect(light).not.toBe(dark);
  });
});
