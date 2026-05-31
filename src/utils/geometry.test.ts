// /src/utils/geometry.test.ts

import { describe, it, expect } from "vitest";

import {
  rectsOverlap,
  rectsAdjacent,
  boundingBox,
  snapToGrid,
  pointOnWall,
  wallOffset,
} from "@/utils/geometry";
import type { Rect } from "@/utils/geometry";

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

describe("rectsOverlap", () => {
  it("returns true for overlapping rects", () => {
    expect(rectsOverlap(rect(0, 0, 4, 4), rect(2, 2, 4, 4))).toBe(true);
  });

  it("returns false for non-overlapping rects", () => {
    expect(rectsOverlap(rect(0, 0, 4, 4), rect(5, 5, 4, 4))).toBe(false);
  });

  it("returns false for rects that only touch on an edge", () => {
    expect(rectsOverlap(rect(0, 0, 4, 4), rect(4, 0, 4, 4))).toBe(false);
  });

  it("returns false for rects that only touch on a corner", () => {
    expect(rectsOverlap(rect(0, 0, 4, 4), rect(4, 4, 4, 4))).toBe(false);
  });

  it("returns true for one rect fully inside another", () => {
    expect(rectsOverlap(rect(0, 0, 10, 10), rect(2, 2, 4, 4))).toBe(true);
  });
});

describe("rectsAdjacent", () => {
  it("returns true for rects sharing a vertical edge", () => {
    expect(rectsAdjacent(rect(0, 0, 4, 4), rect(4, 0, 4, 4))).toBe(true);
  });

  it("returns true for rects sharing a horizontal edge", () => {
    expect(rectsAdjacent(rect(0, 0, 4, 4), rect(0, 4, 4, 4))).toBe(true);
  });

  it("returns false for rects with a gap between them", () => {
    expect(rectsAdjacent(rect(0, 0, 4, 4), rect(5, 0, 4, 4))).toBe(false);
  });

  it("returns false for overlapping rects", () => {
    expect(rectsAdjacent(rect(0, 0, 4, 4), rect(2, 2, 4, 4))).toBe(false);
  });

  it("returns false for rects that only touch on a corner", () => {
    expect(rectsAdjacent(rect(0, 0, 4, 4), rect(4, 4, 4, 4))).toBe(false);
  });
});

describe("boundingBox", () => {
  it("returns zero rect for empty array", () => {
    expect(boundingBox([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it("returns the rect itself for a single rect", () => {
    expect(boundingBox([rect(2, 3, 4, 5)])).toEqual({
      x: 2,
      y: 3,
      width: 4,
      height: 5,
    });
  });

  it("returns bounding box of multiple rects", () => {
    expect(boundingBox([rect(0, 0, 4, 4), rect(6, 2, 4, 4)])).toEqual({
      x: 0,
      y: 0,
      width: 10,
      height: 6,
    });
  });

  it("handles rects at negative coordinates", () => {
    expect(boundingBox([rect(-2, -2, 4, 4), rect(2, 2, 4, 4)])).toEqual({
      x: -2,
      y: -2,
      width: 8,
      height: 8,
    });
  });
});

describe("snapToGrid", () => {
  it("returns the value unchanged if already on grid", () => {
    expect(snapToGrid(40, 20)).toBe(40);
  });

  it("snaps down to nearest cell", () => {
    expect(snapToGrid(22, 20)).toBe(20);
  });

  it("snaps up to nearest cell", () => {
    expect(snapToGrid(38, 20)).toBe(40);
  });

  it("snaps 0 to 0", () => {
    expect(snapToGrid(0, 20)).toBe(0);
  });
});

describe("pointOnWall", () => {
  const r = rect(2, 2, 6, 4);

  it("detects north wall", () => {
    expect(pointOnWall({ x: 4, y: 2 }, r)).toBe("N");
  });

  it("detects south wall", () => {
    expect(pointOnWall({ x: 4, y: 6 }, r)).toBe("S");
  });

  it("detects west wall", () => {
    expect(pointOnWall({ x: 2, y: 4 }, r)).toBe("W");
  });

  it("detects east wall", () => {
    expect(pointOnWall({ x: 8, y: 4 }, r)).toBe("E");
  });

  it("returns null for interior point", () => {
    expect(pointOnWall({ x: 4, y: 4 }, r)).toBeNull();
  });

  it("returns null for exterior point", () => {
    expect(pointOnWall({ x: 0, y: 0 }, r)).toBeNull();
  });
});

describe("wallOffset", () => {
  const r = rect(2, 2, 6, 4);

  it("returns x offset for north wall", () => {
    expect(wallOffset({ x: 5, y: 2 }, r, "N")).toBe(3);
  });

  it("returns x offset for south wall", () => {
    expect(wallOffset({ x: 5, y: 6 }, r, "S")).toBe(3);
  });

  it("returns y offset for west wall", () => {
    expect(wallOffset({ x: 2, y: 5 }, r, "W")).toBe(3);
  });

  it("returns y offset for east wall", () => {
    expect(wallOffset({ x: 8, y: 5 }, r, "E")).toBe(3);
  });
});
