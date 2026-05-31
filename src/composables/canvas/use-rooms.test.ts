// /src/composables/canvas/use-rooms.test.ts

import { describe, it, expect } from "vitest";
import { ref } from "vue";

import type { Fixture } from "@/types/fixtures/fixtures";
import type { UnitSystem } from "@/types/units";

import { useGrid } from "./use-grid";
import { useRooms } from "./use-rooms";

function makeRooms(units: UnitSystem = "imperial") {
  const grid = useGrid(ref(units));
  return { grid, rooms: useRooms(grid) };
}

// 10ft × 10ft room in cm
const ROOM_10x10 = {
  name: "Test Room",
  type: "bedroom" as const,
  widthCm: 304.8,
  depthCm: 304.8,
};

function makeFixture(wall: "N" | "S" | "E" | "W", offsetCm = 40): Fixture {
  return {
    id: crypto.randomUUID(),
    type: "door",
    subtype: "standard",
    wall,
    offsetCm,
    facing: undefined,
  };
}

describe("useRooms", () => {
  describe("addRoom", () => {
    it("adds a room to the list", () => {
      const { rooms } = makeRooms();
      rooms.addRoom(ROOM_10x10);
      expect(rooms.rooms.value).toHaveLength(1);
    });

    it("assigns default solid walls", () => {
      const { rooms } = makeRooms();
      const room = rooms.addRoom(ROOM_10x10);

      expect(room.walls).toEqual({
        N: "solid",
        S: "solid",
        E: "solid",
        W: "solid",
      });
    });

    it("respects partial wall overrides", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        walls: { N: "open" },
      });

      expect(room.walls.N).toBe("open");
      expect(room.walls.S).toBe("solid");
    });

    it("assigns null groupId by default", () => {
      const { rooms } = makeRooms();
      const room = rooms.addRoom(ROOM_10x10);

      expect(room.groupId).toBeNull();
    });

    it("assigns groupId when provided", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "group-1",
      });

      expect(room.groupId).toBe("group-1");
    });

    it("places rooms without overlap", async () => {
      const { rooms, grid } = makeRooms();

      const a = rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);

      const rectA = grid.roomToRect(a);
      const rectB = grid.roomToRect(b);

      const { rectsOverlap } = await import("@/utils/geometry");

      expect(rectsOverlap(rectA, rectB)).toBe(false);
    });
  });

  describe("updateRoom", () => {
    it("updates room fields", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.updateRoom(room.id, { name: "Living Room" });

      expect(rooms.roomById(room.id)?.name).toBe("Living Room");
    });

    it("does nothing for unknown id", () => {
      const { rooms } = makeRooms();

      expect(() =>
        rooms.updateRoom("nonexistent", { name: "X" }),
      ).not.toThrow();
    });
  });

  describe("removeRoom", () => {
    it("removes the room", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.removeRoom(room.id);

      expect(rooms.rooms.value).toHaveLength(0);
    });

    it("does not affect other rooms", () => {
      const { rooms } = makeRooms();

      const a = rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);

      rooms.removeRoom(a.id);

      expect(rooms.roomById(b.id)).toBeDefined();
    });
  });

  describe("canPlace", () => {
    it("returns true for a free position", () => {
      const { rooms } = makeRooms();

      expect(rooms.canPlace(304.8, 304.8, 0, 0)).toBe(true);
    });

    it("returns false when position overlaps existing room", () => {
      const { rooms } = makeRooms();

      rooms.addRoom({ ...ROOM_10x10, groupId: null });

      expect(rooms.canPlace(304.8, 304.8, 0, 0)).toBe(false);
    });

    it("returns false when out of canvas bounds", () => {
      const { rooms } = makeRooms();

      expect(rooms.canPlace(304.8, 304.8, 98, 98)).toBe(false);
    });

    it("excludes the specified room id from collision check", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      expect(rooms.canPlace(304.8, 304.8, room.x, room.y, room.id)).toBe(true);
    });
  });

  describe("drag", () => {
    it("sets draggingId on startDrag", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.startDrag(room.id, room.x, room.y);

      expect(rooms.draggingId.value).toBe(room.id);
    });

    it("clears draggingId on endDrag", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.startDrag(room.id, room.x, room.y);
      rooms.endDrag();

      expect(rooms.draggingId.value).toBeNull();
    });

    it("moves room on moveDrag when position is free", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.startDrag(room.id, room.x, room.y);
      rooms.moveDrag(20, 20);

      expect(rooms.roomById(room.id)?.x).toBe(20);
      expect(rooms.roomById(room.id)?.y).toBe(20);
    });

    it("clamps dragged rooms to canvas bounds", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.startDrag(room.id, room.x, room.y);
      rooms.moveDrag(999, 999);

      expect(room.x).toBeLessThanOrEqual(90);
      expect(room.y).toBeLessThanOrEqual(90);
    });
  });

  describe("mirrorRoom", () => {
    it("mirrorRoom horizontal swaps E/W fixture walls", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      room.fixtures.push(makeFixture("E"));

      rooms.mirrorRoom(room.id, "horizontal");

      expect(room.fixtures[0]?.wall).toBe("W");
    });

    it("mirrorRoom horizontal flips N/S fixture offsets", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      room.fixtures.push(makeFixture("N", 50));

      rooms.mirrorRoom(room.id, "horizontal");

      expect(room.fixtures[0]?.wall).toBe("N");
      expect(room.fixtures[0]?.offsetCm).toBe(room.widthCm - 50);
    });

    it("mirrorRoom vertical swaps N/S fixture walls", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      room.fixtures.push(makeFixture("N"));

      rooms.mirrorRoom(room.id, "vertical");

      expect(room.fixtures[0]?.wall).toBe("S");
    });

    it("mirrorRoom vertical flips E/W fixture offsets", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      room.fixtures.push(makeFixture("E", 60));

      rooms.mirrorRoom(room.id, "vertical");

      expect(room.fixtures[0]?.offsetCm).toBe(room.depthCm - 60);
    });
  });

  describe("groups", () => {
    it("assignGroup sets groupId on room", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom(ROOM_10x10);

      rooms.assignGroup(room.id, "group-1");

      expect(room.groupId).toBe("group-1");
    });

    it("roomsByGroup returns correct rooms", () => {
      const { rooms } = makeRooms();

      const a = rooms.addRoom({ ...ROOM_10x10, groupId: "g1" });
      const b = rooms.addRoom({ ...ROOM_10x10, groupId: "g1" });

      rooms.addRoom({ ...ROOM_10x10, groupId: "g2" });

      const group = rooms.roomsByGroup("g1");

      expect(group).toHaveLength(2);
      expect(group.map((r) => r.id)).toContain(a.id);
      expect(group.map((r) => r.id)).toContain(b.id);
    });

    it("copyGroup creates new rooms with new ids", () => {
      const { rooms } = makeRooms();

      rooms.addRoom({ ...ROOM_10x10, groupId: "g1" });

      rooms.copyGroup("g1", "g2");

      expect(rooms.roomsByGroup("g2")).toHaveLength(1);

      const original = rooms.roomsByGroup("g1")[0];
      const copy = rooms.roomsByGroup("g2")[0];

      expect(copy!.id).not.toBe(original!.id);
    });

    it("copyGroup clones fixtures with new ids", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      room.fixtures.push(makeFixture("N"));

      const copies = rooms.copyGroup("g1", "g2");

      expect(copies[0]?.fixtures[0]?.id).not.toBe(room.fixtures[0]?.id);
    });

    it("rotateGroup 180° keeps single room in place", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const originalX = room.x;
      const originalY = room.y;

      rooms.rotateGroup("g1", 180);

      expect(room.x).toBe(originalX);
      expect(room.y).toBe(originalY);
    });

    it("rotateGroup 90 swaps room width/depth", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        widthCm: 200,
        depthCm: 400,
        groupId: "g1",
      });

      rooms.rotateGroup("g1", 90);

      expect(room.widthCm).toBe(400);
      expect(room.depthCm).toBe(200);
    });

    it("rotateGroup rotates fixture walls", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      room.fixtures.push(makeFixture("N"));

      rooms.rotateGroup("g1", 90);

      expect(room.fixtures[0]?.wall).toBe("E");
    });

    it("moveGroup moves all rooms in group", () => {
      const { rooms } = makeRooms();

      const a = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const b = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const origAX = a.x;
      const origAY = a.y;
      const origBX = b.x;
      const origBY = b.y;

      rooms.moveGroup("g1", 1, 1);

      expect(rooms.roomById(a.id)?.x).toBe(origAX + 1);
      expect(rooms.roomById(b.id)?.x).toBe(origBX + 1);

      expect(rooms.roomById(a.id)?.y).toBe(origAY + 1);
      expect(rooms.roomById(b.id)?.y).toBe(origBY + 1);
    });

    it("moveGroup prevents collisions with non-group rooms", () => {
      const { rooms } = makeRooms();

      const grouped = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const blocker = rooms.addRoom({
        ...ROOM_10x10,
        groupId: null,
      });

      blocker.x = grouped.x + 10;

      const originalX = grouped.x;

      rooms.moveGroup("g1", 10, 0);

      expect(grouped.x).toBe(originalX);
    });

    it("mirrorGroup horizontal mirrors room positions", () => {
      const { rooms } = makeRooms();

      const a = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const b = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const originalAX = a.x;
      const originalBX = b.x;

      rooms.mirrorGroup("g1", "horizontal");

      expect(a.x).toBe(originalBX);
      expect(b.x).toBe(originalAX);
    });
  });

  describe("group drag", () => {
    it("moves grouped rooms during group drag", () => {
      const { rooms } = makeRooms();

      const room = rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      const originalX = room.x;

      rooms.startGroupDrag("g1", 0, 0);
      rooms.moveGroupDrag(2, 0);

      expect(room.x).toBe(originalX + 2);
    });

    it("clears group drag state on endGroupDrag", () => {
      const { rooms } = makeRooms();

      rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      rooms.startGroupDrag("g1", 0, 0);

      expect(() => rooms.endGroupDrag()).not.toThrow();
    });
  });

  describe("ungroupedRooms", () => {
    it("returns only rooms with null groupId", () => {
      const { rooms } = makeRooms();

      rooms.addRoom({
        ...ROOM_10x10,
        groupId: null,
      });

      rooms.addRoom({
        ...ROOM_10x10,
        groupId: "g1",
      });

      expect(rooms.ungroupedRooms.value).toHaveLength(1);
    });
  });
});
