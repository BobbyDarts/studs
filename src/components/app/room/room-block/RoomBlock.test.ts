// /src/components/app/room/room-block/RoomBlock.test.ts

import { render, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

import { useProjectStore } from "@/stores/project";
import { createStoreMock } from "@/test-utils/create-store-mock";

import { RoomBlock } from ".";

vi.mock("@/stores/project");

type ProjectStore = ReturnType<typeof useProjectStore>;

const baseRoom = {
  id: "r1",
  name: "Living Room",
  type: "living" as const,
  x: 2,
  y: 3,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

const globalConfig = {
  provide: {
    canvasInnerRef: ref<HTMLElement | null>(null),
  },
};

describe("RoomBlock", () => {
  let mock: ProjectStore;

  beforeEach(() => {
    mock = createStoreMock() as unknown as ProjectStore;

    vi.mocked(useProjectStore).mockReturnValue(mock);
  });

  it("positions itself based on room x/y and cellSizePx", () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild as HTMLElement;

    expect(block.style.left).toBe("80px");
    expect(block.style.top).toBe("120px");
  });

  it("sizes itself based on room dimensions", () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild as HTMLElement;

    expect(block.style.width).toBe("400px");
    expect(block.style.height).toBe("400px");
  });

  it("emits select on pointerdown", async () => {
    const { container, emitted } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block);

    expect(emitted().select).toBeTruthy();
    expect(emitted().select![0]).toEqual(["r1"]);
  });

  it("emits shift-select when shift key is held", async () => {
    const { container, emitted } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block, {
      shiftKey: true,
    });

    expect(emitted()["shift-select"]).toBeTruthy();
    expect(emitted()["shift-select"]![0]).toEqual(["r1"]);
  });

  it("emits open-edit on double click", async () => {
    const { container, emitted } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.dblClick(block);

    expect(emitted()["open-edit"]).toBeTruthy();
    expect(emitted()["open-edit"]![0]).toEqual(["r1"]);
  });

  it("emits add-fixture on context menu", async () => {
    const { container, emitted } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.contextMenu(block);

    expect(emitted()["add-fixture"]).toBeTruthy();
    expect(emitted()["add-fixture"]![0]).toEqual(["r1"]);
  });

  it("applies selected styles when selected prop is true", () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: true },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    expect(block.className).toContain("z-10");
  });

  it("renders solid wall borders", () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild as HTMLElement;

    expect(block.style.borderTop).toBe("2px solid var(--wall-color)");
  });

  it("renders open wall as no border", () => {
    const room = {
      ...baseRoom,
      walls: { N: "open", S: "solid", E: "solid", W: "solid" } as const,
    };

    const { container } = render(RoomBlock, {
      props: { room, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild as HTMLElement;

    expect(block.style.borderTopStyle).toBe("none");
  });

  it("renders virtual wall as dashed border", () => {
    const room = {
      ...baseRoom,
      walls: { N: "virtual", S: "solid", E: "solid", W: "solid" } as const,
    };

    const { container } = render(RoomBlock, {
      props: { room, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild as HTMLElement;

    expect(block.style.borderTop).toBe("1px dashed var(--wall-virtual)");
  });

  it("ignores right-click pointerdown", async () => {
    const { container, emitted } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block, {
      button: 2,
    });

    expect(emitted().select).toBeFalsy();
    expect(mock.rooms.startDrag).not.toHaveBeenCalled();
  });

  it("does not start dragging below threshold", async () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block, {
      clientX: 100,
      clientY: 100,
      offsetX: 10,
      offsetY: 10,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 102,
        clientY: 102,
      }),
    );

    expect(mock.rooms.startDrag).not.toHaveBeenCalled();
  });

  it("starts dragging after threshold exceeded", async () => {
    const { container } = render(RoomBlock, {
      props: { room: baseRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block, {
      clientX: 100,
      clientY: 100,
      offsetX: 10,
      offsetY: 10,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 120,
        clientY: 120,
      }),
    );

    expect(mock.rooms.startDrag).toHaveBeenCalled();
  });

  it("starts group drag when room belongs to a group", async () => {
    const groupedRoom = {
      ...baseRoom,
      groupId: "g1",
    };

    const { container } = render(RoomBlock, {
      props: { room: groupedRoom, selected: false },
      global: globalConfig,
    });

    const block = container.firstElementChild!;

    await fireEvent.pointerDown(block, {
      clientX: 100,
      clientY: 100,
      offsetX: 10,
      offsetY: 10,
    });

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 120,
        clientY: 120,
      }),
    );

    expect(mock.rooms.startGroupDrag).toHaveBeenCalled();
    expect(mock.rooms.startDrag).not.toHaveBeenCalled();
  });
});
