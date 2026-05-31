// /src/components/app/deadspace/dead-space-overlay/DeadSpaceOverlay.test.ts

import { render } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { DeadSpaceOverlay } from ".";

vi.mock("@/stores/project");

describe("DeadSpaceOverlay", () => {
  let mock: ReturnType<typeof createStoreMock>;

  beforeEach(() => {
    mock = createStoreMock();
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
  });

  it("renders an SVG element", () => {
    const { container } = render(DeadSpaceOverlay);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders no rects when no dead space", () => {
    const { container } = render(DeadSpaceOverlay);
    expect(container.querySelectorAll("rect")).toHaveLength(0);
  });

  it("renders bounding box cells", () => {
    mock.deadSpace.boundingBoxCells = [
      { x: 0, y: 0, type: "bounding-box" },
      { x: 1, y: 0, type: "bounding-box" },
    ] as unknown as typeof mock.deadSpace.boundingBoxCells;
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
    const { container } = render(DeadSpaceOverlay);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
  });

  it("renders enclosed cells on top of bounding box cells", () => {
    mock.deadSpace.boundingBoxCells = [
      { x: 0, y: 0, type: "bounding-box" },
    ] as unknown as typeof mock.deadSpace.boundingBoxCells;
    mock.deadSpace.enclosedCells = [
      { x: 1, y: 0, type: "enclosed" },
    ] as unknown as typeof mock.deadSpace.enclosedCells;
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
    const { container } = render(DeadSpaceOverlay);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
  });

  it("positions cells correctly based on cellSizePx", () => {
    mock.deadSpace.boundingBoxCells = [
      { x: 3, y: 5, type: "bounding-box" },
    ] as unknown as typeof mock.deadSpace.boundingBoxCells;
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
    const { container } = render(DeadSpaceOverlay);
    const rect = container.querySelector("rect")!;
    expect(rect.getAttribute("x")).toBe("120"); // 3 * 40
    expect(rect.getAttribute("y")).toBe("200"); // 5 * 40
  });
});
