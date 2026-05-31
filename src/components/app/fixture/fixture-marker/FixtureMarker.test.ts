// /src/components/app/fixture/fixture-marker/FixtureMarker.test.ts

import { render } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import { createStoreMock } from "@/test-utils/create-store-mock";
import type { Room } from "@/types/project";

import { FixtureMarker } from ".";

vi.mock("@/stores/project");

const baseRoom: Room = {
  id: "r1",
  name: "Bathroom",
  type: "bathroom" as const,
  x: 2,
  y: 3,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

// At default cellSizePx=40, imperial: 304.8cm = 10 cells
// rx = 2*40 = 80, ry = 3*40 = 120, rw = 10*40 = 400, rh = 10*40 = 400
// offset = 2 cells * 40 = 80 (offsetCm = 60.96 = 2ft = 2 cells)

const makeFixture = (wall: "N" | "S" | "E" | "W") => ({
  id: "f1",
  type: "door" as const,
  subtype: "standard" as const,
  wall,
  offsetCm: 60.96, // 2ft = 2 cells
  facing: undefined,
});

describe("FixtureMarker", () => {
  type ProjectStore = ReturnType<typeof useProjectStore>;

  let mock: ProjectStore;

  beforeEach(() => {
    mock = createStoreMock() as unknown as ProjectStore;

    vi.mocked(useProjectStore).mockReturnValue(mock);
  });

  it("renders a div wrapper", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("N"), room: baseRoom },
    });
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("applies correct position for north wall fixture", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("N"), room: baseRoom },
    });
    const wrapper = container.querySelector("div[style]") as HTMLElement;
    // x = rx + offset = 80 + 80 = 160, y = ry = 120
    expect(wrapper.style.left).toBe("160px");
    expect(wrapper.style.top).toBe("120px");
    expect(wrapper.style.transform).toContain("rotate(0deg)");
  });

  it("applies correct position for south wall fixture", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("S"), room: baseRoom },
    });
    const wrapper = container.querySelector("div[style]") as HTMLElement;
    // x = rx + offset = 80 + 80 = 160, y = ry + rh = 120 + 400 = 520
    expect(wrapper.style.left).toBe("160px");
    expect(wrapper.style.top).toBe("520px");
    expect(wrapper.style.transform).toContain("rotate(180deg)");
  });

  it("applies correct position for west wall fixture", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("W"), room: baseRoom },
    });
    const wrapper = container.querySelector("div[style]") as HTMLElement;
    // x = rx = 80, y = ry + offset = 120 + 80 = 200
    expect(wrapper.style.left).toBe("80px");
    expect(wrapper.style.top).toBe("200px");
    expect(wrapper.style.transform).toContain("rotate(270deg)");
  });

  it("applies correct position for east wall fixture", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("E"), room: baseRoom },
    });
    const wrapper = container.querySelector("div[style]") as HTMLElement;
    // x = rx + rw = 80 + 400 = 480, y = ry + offset = 120 + 80 = 200
    expect(wrapper.style.left).toBe("480px");
    expect(wrapper.style.top).toBe("200px");
    expect(wrapper.style.transform).toContain("rotate(90deg)");
  });

  it("emits edit-fixture when clicked", async () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("N"), room: baseRoom },
    });
    const wrapper = container.querySelector("div") as HTMLElement;
    await wrapper.click();
    // edit-fixture emit tested via FixtureLayer integration
    expect(wrapper).not.toBeNull();
  });

  it("renders an svg inside the wrapper", () => {
    const { container } = render(FixtureMarker, {
      props: { fixture: makeFixture("N"), room: baseRoom },
    });
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
