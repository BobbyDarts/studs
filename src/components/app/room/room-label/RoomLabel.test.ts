// /src/components/app/room/room-label/RoomLabel.test.ts

import { render } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { RoomLabel } from ".";

vi.mock("@/stores/project");

const baseRoom = {
  id: "r1",
  name: "Kitchen",
  type: "kitchen" as const,
  x: 0,
  y: 0,
  widthCm: 304.8,
  depthCm: 365.76,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

describe("RoomLabel", () => {
  beforeEach(() => {
    vi.mocked(useProjectStore).mockReturnValue(
      createStoreMock() as unknown as StoreMock,
    );
  });

  it("renders the room name", () => {
    const { getByText } = render(RoomLabel, { props: { room: baseRoom } });
    expect(getByText("Kitchen")).toBeTruthy();
  });

  it("renders imperial dimensions", () => {
    const { getByText } = render(RoomLabel, { props: { room: baseRoom } });
    expect(getByText("10' W × 12' D")).toBeTruthy();
  });

  it("renders metric dimensions when store units is metric", () => {
    const mock = createStoreMock();
    mock.units = "metric";
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
    const { getByText } = render(RoomLabel, { props: { room: baseRoom } });
    expect(getByText("3.05 m W × 3.66 m D")).toBeTruthy();
  });
});
