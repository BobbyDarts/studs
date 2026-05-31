// /src/composables/canvas/use-canvas-controls.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { useCanvasControls } from "@/composables/canvas/use-canvas-controls";
import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

vi.mock("@/stores/project");

describe("useCanvasControls", () => {
  let mock: StoreMock;
  let scroller: HTMLElement;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    vi.mocked(useProjectStore).mockReturnValue(mock);

    scroller = document.createElement("div");
    Object.defineProperty(scroller, "clientWidth", {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(scroller, "clientHeight", {
      value: 600,
      configurable: true,
    });
    scroller.scrollLeft = 0;
    scroller.scrollTop = 0;
  });

  it("scrollToRooms scrolls to origin when no rooms", () => {
    mock.rooms.rooms = [] as unknown as StoreMock["rooms"]["rooms"];
    const { scrollToRooms } = useCanvasControls(() => scroller);
    scrollToRooms();
    expect(scroller.scrollLeft).toBe(0);
    expect(scroller.scrollTop).toBe(0);
  });

  it("zoomIn calls grid.zoom with 1", () => {
    const { zoomIn } = useCanvasControls(() => scroller);
    zoomIn();
    expect(mock.grid.zoom).toHaveBeenCalledWith(1);
  });

  it("zoomOut calls grid.zoom with -1", () => {
    const { zoomOut } = useCanvasControls(() => scroller);
    zoomOut();
    expect(mock.grid.zoom).toHaveBeenCalledWith(-1);
  });

  it("resetZoom calls grid.resetZoom", async () => {
    const { resetZoom } = useCanvasControls(() => scroller);
    await resetZoom();
    expect(mock.grid.resetZoom).toHaveBeenCalled();
  });

  it("returns null scroller gracefully", () => {
    const { scrollToRooms } = useCanvasControls(() => null);
    expect(() => scrollToRooms()).not.toThrow();
  });
});
