// /src/components/app/canvas/grid-overlay/GridOverlay.test.ts

import { render } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { GridOverlay } from ".";

vi.mock("@/stores/project");

describe("GridOverlay", () => {
  beforeEach(() => {
    vi.mocked(useProjectStore).mockReturnValue(
      createStoreMock() as unknown as StoreMock,
    );
  });

  it("renders an SVG element", () => {
    const { container } = render(GridOverlay);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("sets SVG dimensions from grid", () => {
    const { container } = render(GridOverlay);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("2000");
    expect(svg.getAttribute("height")).toBe("2000");
  });

  it("renders vertical and horizontal grid lines", () => {
    const { container } = render(GridOverlay);
    const lines = container.querySelectorAll("line");
    // 51 vertical + 51 horizontal = 102 lines for a 50×50 grid
    expect(lines.length).toBe(102);
  });

  it("marks every 10th line as major", () => {
    const { container } = render(GridOverlay);
    const majorLines = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("stroke-width") === "0.75",
    );
    // 6 vertical majors (0,10,20,30,40,50) + 6 horizontal = 12
    expect(majorLines.length).toBe(12);
  });
});
