// /src/composables/canvas/use-fixtures.test.ts

import { describe, it, expect } from "vitest";

import type { Room } from "@/types/project";

import { useFixtures } from "./use-fixtures";

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "room-1",
    name: "Test Room",
    type: "bedroom",
    x: 0,
    y: 0,
    widthCm: 304.8,
    depthCm: 304.8,
    walls: { N: "solid", S: "solid", E: "solid", W: "solid" },
    groupId: null,
    fixtures: [],
    ...overrides,
  };
}

describe("useFixtures", () => {
  describe("addFixture", () => {
    it("adds a fixture to the room", () => {
      const { addFixture } = useFixtures();
      const room = makeRoom();
      addFixture(room, {
        type: "door",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
      });
      expect(room.fixtures).toHaveLength(1);
    });

    it("assigns default facing of undefined", () => {
      const { addFixture } = useFixtures();
      const room = makeRoom();
      const fixture = addFixture(room, {
        type: "window",
        subtype: "standard",
        wall: "S",
        offsetCm: 60,
      });
      expect(fixture.facing).toBeUndefined();
    });

    it("assigns facing when provided", () => {
      const { addFixture } = useFixtures();
      const room = makeRoom();
      const fixture = addFixture(room, {
        type: "door",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
        facing: "in",
      });
      expect(fixture.facing).toBe("in");
    });
  });

  describe("updateFixture", () => {
    it("updates fixture fields", () => {
      const { addFixture, updateFixture } = useFixtures();
      const room = makeRoom();
      const fixture = addFixture(room, {
        type: "door",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
      });
      updateFixture(room, fixture.id, { wall: "S", offsetCm: 90 });
      expect(room.fixtures[0]!.wall).toBe("S");
      expect(room.fixtures[0]!.offsetCm).toBe(90);
    });

    it("does nothing for unknown fixture id", () => {
      const { updateFixture } = useFixtures();
      const room = makeRoom();
      expect(() =>
        updateFixture(room, "nonexistent", { wall: "S" }),
      ).not.toThrow();
    });
  });

  describe("removeFixture", () => {
    it("removes the fixture from the room", () => {
      const { addFixture, removeFixture } = useFixtures();
      const room = makeRoom();
      const fixture = addFixture(room, {
        type: "toilet",
        subtype: undefined,
        wall: "N",
        offsetCm: 30,
      });
      removeFixture(room, fixture.id);
      expect(room.fixtures).toHaveLength(0);
    });

    it("does not affect other fixtures", () => {
      const { addFixture, removeFixture } = useFixtures();
      const room = makeRoom();
      const a = addFixture(room, {
        type: "toilet",
        subtype: undefined,
        wall: "N",
        offsetCm: 30,
      });
      const b = addFixture(room, {
        type: "sink",
        subtype: "standard",
        wall: "E",
        offsetCm: 30,
      });
      removeFixture(room, a.id);
      expect(room.fixtures.find((f) => f.id === b.id)).toBeDefined();
    });
  });

  describe("fixturesOnWall", () => {
    it("returns fixtures on the specified wall", () => {
      const { addFixture, fixturesOnWall } = useFixtures();
      const room = makeRoom();
      addFixture(room, {
        type: "door",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
      });
      addFixture(room, {
        type: "window",
        subtype: "standard",
        wall: "N",
        offsetCm: 120,
      });
      addFixture(room, {
        type: "window",
        subtype: "standard",
        wall: "S",
        offsetCm: 60,
      });
      expect(fixturesOnWall(room, "N")).toHaveLength(2);
      expect(fixturesOnWall(room, "S")).toHaveLength(1);
      expect(fixturesOnWall(room, "E")).toHaveLength(0);
    });
  });

  describe("validateFixtures", () => {
    it("returns fixtures whose offset exceeds wall length", () => {
      const { addFixture, validateFixtures } = useFixtures();
      const room = makeRoom();
      addFixture(room, {
        type: "window",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
      });
      addFixture(room, {
        type: "door",
        subtype: "standard",
        wall: "N",
        offsetCm: 400,
      });
      const invalid = validateFixtures(room);
      expect(invalid).toHaveLength(1);
      expect(invalid[0]!.offsetCm).toBe(400);
    });

    it("returns empty when all fixtures are valid", () => {
      const { addFixture, validateFixtures } = useFixtures();
      const room = makeRoom();
      addFixture(room, {
        type: "window",
        subtype: "standard",
        wall: "N",
        offsetCm: 60,
      });
      expect(validateFixtures(room)).toHaveLength(0);
    });
  });

  describe("wallAcceptsFixtures", () => {
    it("returns true for solid wall", () => {
      const { wallAcceptsFixtures } = useFixtures();
      const room = makeRoom();
      expect(wallAcceptsFixtures(room, "N")).toBe(true);
    });

    it("returns true for virtual wall", () => {
      const { wallAcceptsFixtures } = useFixtures();
      const room = makeRoom({
        walls: { N: "virtual", S: "solid", E: "solid", W: "solid" },
      });
      expect(wallAcceptsFixtures(room, "N")).toBe(true);
    });

    it("returns false for open wall", () => {
      const { wallAcceptsFixtures } = useFixtures();
      const room = makeRoom({
        walls: { N: "open", S: "solid", E: "solid", W: "solid" },
      });
      expect(wallAcceptsFixtures(room, "N")).toBe(false);
    });
  });
});
