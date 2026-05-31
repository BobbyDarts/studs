// /src/components/app/canvas/floorplan-canvas/FloorplanCanvas.test.ts

import { render, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCanvasControls } from "@/composables/canvas";
import { useProjectStore } from "@/stores/project";
import { createStoreMock } from "@/test-utils/create-store-mock";

import { FloorplanCanvas } from ".";

vi.mock("@/stores/project");

vi.mock("@/components/app/canvas/grid-overlay", () => ({
  GridOverlay: { template: '<div data-testid="grid-overlay" />' },
}));

vi.mock("@/composables/canvas", () => ({
  useCanvasControls: vi.fn(),
}));

type ProjectStore = ReturnType<typeof useProjectStore>;

describe("FloorplanCanvas", () => {
  let mock: ProjectStore;

  const controlsMock = {
    fitToScreen: vi.fn(),
    scrollToRooms: vi.fn(),
    centerOnGrid: vi.fn(),
    resetZoom: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  };

  beforeEach(() => {
    mock = createStoreMock() as unknown as ProjectStore;

    vi.mocked(useProjectStore).mockReturnValue(mock);

    vi.mocked(useCanvasControls).mockReturnValue(controlsMock);
  });

  it("renders the canvas scroll container", () => {
    const { container } = render(FloorplanCanvas);

    expect(container.firstElementChild).not.toBeNull();
  });

  it("applies correct width and height to the inner canvas", () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.firstElementChild
      ?.firstElementChild as HTMLElement;

    const inner = scroller?.firstElementChild as HTMLElement;

    expect(inner.style.width).toBe("2000px");
    expect(inner.style.height).toBe("2000px");
  });

  it("renders the grid overlay", () => {
    const { getByTestId } = render(FloorplanCanvas);

    expect(getByTestId("grid-overlay")).not.toBeNull();
  });

  it("emits click-canvas when background is clicked", async () => {
    const { container, emitted } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    await fireEvent.click(scroller);

    expect(emitted()["click-canvas"]).toBeTruthy();
  });

  it("calls scrollToRooms on mount", () => {
    render(FloorplanCanvas);

    expect(controlsMock.scrollToRooms).toHaveBeenCalled();
  });

  it("zooms on wheel", async () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    Object.defineProperty(scroller, "getBoundingClientRect", {
      value: () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 1000,
      }),
    });

    await fireEvent.wheel(scroller, {
      deltaY: -100,
      clientX: 100,
      clientY: 100,
    });

    expect(mock.grid.zoom).toHaveBeenCalledWith(100);
  });

  it("applies grab cursor while space is held", async () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    await fireEvent.keyDown(scroller, {
      code: "Space",
    });

    expect(scroller.className).toContain("cursor-grab");

    await fireEvent.keyUp(scroller, {
      code: "Space",
    });

    expect(scroller.className).not.toContain("cursor-grab");
  });

  it("starts panning with middle mouse button", async () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    scroller.scrollLeft = 100;
    scroller.scrollTop = 200;

    await fireEvent.pointerDown(scroller, {
      button: 1,
      clientX: 100,
      clientY: 100,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 120,
        clientY: 130,
      }),
    );

    expect(scroller.scrollLeft).not.toBe(100);
    expect(scroller.scrollTop).not.toBe(200);
  });

  it("does not start panning on normal left click", async () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    scroller.scrollLeft = 100;

    await fireEvent.pointerDown(scroller, {
      button: 0,
      clientX: 100,
      clientY: 100,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 200,
        clientY: 200,
      }),
    );

    expect(scroller.scrollLeft).toBe(100);
  });

  it("starts panning with space + left click", async () => {
    const { container } = render(FloorplanCanvas);

    const scroller = container.querySelector(".overflow-auto")!;

    await fireEvent.keyDown(scroller, {
      code: "Space",
    });

    scroller.scrollLeft = 100;

    await fireEvent.pointerDown(scroller, {
      button: 0,
      clientX: 100,
      clientY: 100,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 100,
      }),
    );

    expect(scroller.scrollLeft).not.toBe(100);
  });
});
