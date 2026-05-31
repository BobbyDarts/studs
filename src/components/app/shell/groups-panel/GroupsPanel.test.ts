// /src/components/app/shell/groups-panel/GroupsPanel.test.ts

import { render, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { GroupsPanel } from ".";

vi.mock("@/stores/project");
vi.mock("@/composables/canvas", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useSelection: () => ({
      selectMany: vi.fn(),
      selectedIds: { value: new Set() },
    }),
  };
});

vi.mock("@/composables/ui", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useTheme: () => ({ themeMode: { value: "light" } }),
  };
});

const baseGroup = { id: "g1", name: "Master Suite" };
const baseRoom = {
  id: "r1",
  name: "Bedroom",
  type: "bedroom" as const,
  x: 0,
  y: 0,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: "g1",
  fixtures: [],
};

describe("GroupsPanel", () => {
  let mock: StoreMock;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    vi.mocked(useProjectStore).mockReturnValue(mock);
    localStorage.clear();
    localStorage.setItem("studs-groups-panel-visible", "true");
  });

  it("does not render when no groups exist", () => {
    mock.groups = [] as unknown as StoreMock["groups"];
    const { container } = render(GroupsPanel);
    expect(container.firstElementChild).toBeNull();
  });

  it("does not render when visible is false", () => {
    localStorage.setItem("studs-groups-panel-visible", "false");
    mock.groups = [baseGroup] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi.fn().mockReturnValue([baseRoom]);
    const { container } = render(GroupsPanel);
    expect(container.firstElementChild).toBeNull();
  });

  it("renders the Groups header when groups exist", () => {
    mock.groups = [baseGroup] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi.fn().mockReturnValue([baseRoom]);
    const { getByText } = render(GroupsPanel);
    expect(getByText("Groups")).toBeTruthy();
  });

  it("renders each group name", () => {
    mock.groups = [
      { id: "g1", name: "Master Suite" },
      { id: "g2", name: "Guest Suite" },
    ] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi.fn().mockReturnValue([baseRoom]);
    const { getByText } = render(GroupsPanel);
    expect(getByText("Master Suite")).toBeTruthy();
    expect(getByText("Guest Suite")).toBeTruthy();
  });

  it("renders room count for each group", () => {
    mock.groups = [baseGroup] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi
      .fn()
      .mockReturnValue([baseRoom, { ...baseRoom, id: "r2" }]);
    const { getByText } = render(GroupsPanel);
    expect(getByText("2")).toBeTruthy();
  });

  it("hides panel when X button is clicked", async () => {
    mock.groups = [baseGroup] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi.fn().mockReturnValue([baseRoom]);
    const { container, queryByText } = render(GroupsPanel);
    const closeBtn = container.querySelector("button.size-5") as HTMLElement;
    await fireEvent.click(closeBtn);
    expect(queryByText("Groups")).toBeNull();
  });

  it("emits go-to-group when crosshair button is clicked", async () => {
    mock.groups = [baseGroup] as unknown as StoreMock["groups"];
    mock.rooms.roomsByGroup = vi.fn().mockReturnValue([baseRoom]);
    const { container, emitted } = render(GroupsPanel);
    // Hover to reveal go-to button then click
    const goToBtn = container.querySelector(
      ".size-5.p-0.opacity-0",
    ) as HTMLElement;
    if (goToBtn) await fireEvent.click(goToBtn);
    expect(emitted()["go-to-group"]).toBeTruthy();
  });
});
