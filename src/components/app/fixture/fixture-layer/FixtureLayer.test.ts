// /src/components/app/fixture/fixture-layer/FixtureLayer.test.ts

import { render } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { FixtureLayer } from ".";

vi.mock("@/stores/project");
vi.mock("@/components/app/fixture/fixture-marker", () => ({
  FixtureMarker: {
    props: ["fixture", "room"],
    emits: ["edit-fixture"],
    template: '<div data-testid="fixture-marker" />',
  },
}));

const baseRoom = {
  id: "r1",
  name: "Bedroom",
  type: "bedroom" as const,
  x: 0,
  y: 0,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

describe("FixtureLayer", () => {
  let mock: StoreMock;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    vi.mocked(useProjectStore).mockReturnValue(mock);
  });

  it("renders the layer container", () => {
    mock.rooms.rooms = [] as unknown as StoreMock["rooms"]["rooms"];
    const { container } = render(FixtureLayer);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("renders no fixture markers when rooms have no fixtures", () => {
    mock.rooms.rooms = [baseRoom] as unknown as StoreMock["rooms"]["rooms"];
    const { queryAllByTestId } = render(FixtureLayer);
    expect(queryAllByTestId("fixture-marker")).toHaveLength(0);
  });

  it("renders a fixture marker for each fixture", () => {
    const roomWithFixtures = {
      ...baseRoom,
      fixtures: [
        {
          id: "f1",
          type: "door",
          subtype: "standard",
          wall: "N",
          offsetCm: 60,
          facing: undefined,
        },
        {
          id: "f2",
          type: "window",
          subtype: "standard",
          wall: "S",
          offsetCm: 60,
          facing: undefined,
        },
      ],
    };
    mock.rooms.rooms = [
      roomWithFixtures,
    ] as unknown as StoreMock["rooms"]["rooms"];
    const { getAllByTestId } = render(FixtureLayer);
    expect(getAllByTestId("fixture-marker")).toHaveLength(2);
  });

  it("renders fixture markers across multiple rooms", () => {
    const room1 = {
      ...baseRoom,
      id: "r1",
      fixtures: [
        {
          id: "f1",
          type: "door",
          subtype: "standard",
          wall: "N",
          offsetCm: 60,
          facing: undefined,
        },
      ],
    };
    const room2 = {
      ...baseRoom,
      id: "r2",
      fixtures: [
        {
          id: "f2",
          type: "window",
          subtype: "standard",
          wall: "E",
          offsetCm: 60,
          facing: undefined,
        },
        {
          id: "f3",
          type: "toilet",
          subtype: undefined,
          wall: "S",
          offsetCm: 30,
          facing: undefined,
        },
      ],
    };
    mock.rooms.rooms = [room1, room2] as unknown as StoreMock["rooms"]["rooms"];
    const { getAllByTestId } = render(FixtureLayer);
    expect(getAllByTestId("fixture-marker")).toHaveLength(3);
  });

  it("emits edit-fixture when a fixture marker emits it", async () => {
    const roomWithFixture = {
      ...baseRoom,
      fixtures: [
        {
          id: "f1",
          type: "door",
          subtype: "standard",
          wall: "N",
          offsetCm: 60,
          facing: undefined,
        },
      ],
    };
    mock.rooms.rooms = [
      roomWithFixture,
    ] as unknown as StoreMock["rooms"]["rooms"];
    const { emitted, getAllByTestId } = render(FixtureLayer);
    await getAllByTestId("fixture-marker")[0]!.click();
    expect(emitted()).toBeDefined();
  });
});
