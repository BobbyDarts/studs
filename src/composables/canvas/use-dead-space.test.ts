// /src/composables/canvas/use-dead-space.test.ts

import { describe, it, expect } from "vitest";
import { ref } from "vue";

import { useDeadSpace } from "./use-dead-space";
import { useGrid } from "./use-grid";
import { useRooms } from "./use-rooms";

function makeDeadSpace() {
  const units = ref<"imperial" | "metric">("imperial");
  const grid = useGrid(units);
  const rooms = useRooms(grid);
  const deadSpace = useDeadSpace(grid, rooms);
  return { grid, rooms, deadSpace };
}

// 10ft × 10ft
const ROOM_10x10 = {
  name: "R",
  type: "bedroom" as const,
  widthCm: 304.8,
  depthCm: 304.8,
};

describe("useDeadSpace", () => {
  describe("with no rooms", () => {
    it("returns no dead space cells", () => {
      const { deadSpace } = makeDeadSpace();
      expect(deadSpace.allDeadSpaceCells.value).toHaveLength(0);
      expect(deadSpace.enclosedCells.value).toHaveLength(0);
      expect(deadSpace.boundingBoxCells.value).toHaveLength(0);
    });
  });

  describe("bounding box dead space", () => {
    it("detects unoccupied cells within bounding box of two non-adjacent rooms", () => {
      const { rooms, deadSpace } = makeDeadSpace();
      // Place room at 0,0 and another at 20,0 — gap between them
      rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);
      rooms.updateRoom(b.id, { x: 20, y: 0 });
      expect(deadSpace.boundingBoxCells.value.length).toBeGreaterThan(0);
    });

    it("returns no bounding box dead space when rooms fill their bounding box", () => {
      const { rooms, deadSpace } = makeDeadSpace();
      // Two adjacent rooms filling a 20×10 bounding box exactly
      const a = rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);
      rooms.updateRoom(a.id, { x: 0, y: 0 });
      rooms.updateRoom(b.id, { x: 10, y: 0 });
      expect(deadSpace.boundingBoxCells.value).toHaveLength(0);
    });
  });

  describe("enclosed dead space", () => {
    it("detects cells fully enclosed by rooms", () => {
      const { rooms, deadSpace } = makeDeadSpace();
      // Build a hollow square: 4 rooms forming a ring with a gap in the middle
      // Top: 3×1 room at (1,0)
      rooms.addRoom({
        name: "Top",
        type: "other",
        widthCm: 3 * 30.48,
        depthCm: 30.48,
      });
      const top = rooms.rooms.value[0];
      rooms.updateRoom(top!.id, { x: 1, y: 0 });

      // Bottom: 3×1 at (1,2)
      rooms.addRoom({
        name: "Bottom",
        type: "other",
        widthCm: 3 * 30.48,
        depthCm: 30.48,
      });
      const bottom = rooms.rooms.value[1];
      rooms.updateRoom(bottom!.id, { x: 1, y: 2 });

      // Left: 1×3 at (0,0)
      rooms.addRoom({
        name: "Left",
        type: "other",
        widthCm: 30.48,
        depthCm: 3 * 30.48,
      });
      const left = rooms.rooms.value[2];
      rooms.updateRoom(left!.id, { x: 0, y: 0 });

      // Right: 1×3 at (4,0)
      rooms.addRoom({
        name: "Right",
        type: "other",
        widthCm: 30.48,
        depthCm: 3 * 30.48,
      });
      const right = rooms.rooms.value[3];
      rooms.updateRoom(right!.id, { x: 4, y: 0 });

      expect(deadSpace.enclosedCells.value.length).toBeGreaterThan(0);
    });
  });

  describe("allDeadSpaceCells", () => {
    it("does not duplicate cells between enclosed and bounding box", () => {
      const { rooms, deadSpace } = makeDeadSpace();
      rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);
      rooms.updateRoom(b.id, { x: 20, y: 0 });

      const all = deadSpace.allDeadSpaceCells.value;
      const keys = all.map((c) => `${c.x},${c.y}`);
      const unique = new Set(keys);
      expect(keys.length).toBe(unique.size);
    });
  });

  describe("area calculations", () => {
    it("enclosedAreaCm is 0 with no enclosed cells", () => {
      const { deadSpace } = makeDeadSpace();
      expect(deadSpace.enclosedAreaCm.value).toBe(0);
    });

    it("boundingBoxAreaCm scales with cell count", () => {
      const { rooms, deadSpace, grid } = makeDeadSpace();
      rooms.addRoom(ROOM_10x10);
      const b = rooms.addRoom(ROOM_10x10);
      rooms.updateRoom(b.id, { x: 20, y: 0 });
      const cellCount = deadSpace.boundingBoxCells.value.length;
      const expected = cellCount * Math.pow(grid.cmPerCell.value, 2);
      expect(deadSpace.boundingBoxAreaCm.value).toBeCloseTo(expected);
    });
  });
});
