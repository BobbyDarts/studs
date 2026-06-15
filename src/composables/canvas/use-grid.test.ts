// /src/composables/canvas/use-grid.test.ts

import { describe, it, expect } from "vitest";

import { useGrid } from "./use-grid";

function makeGrid() {
  return useGrid();
}

describe("useGrid", () => {
  describe("cmPerCell", () => {
    it("is always 30.48 regardless of units", () => {
      const grid = useGrid();
      expect(grid.cmPerCell).toBeCloseTo(30.48);
    });
  });

  describe("cmToCells / cellsToCm", () => {
    it("converts cm to cells consistently regardless of units", () => {
      const grid = useGrid();
      expect(grid.cmToCells(30.48)).toBeCloseTo(1);
      expect(grid.cmToCells(304.8)).toBeCloseTo(10);
    });

    it("round-trips cellsToCm", () => {
      const grid = makeGrid();
      expect(grid.cellsToCm(grid.cmToCells(304.8))).toBeCloseTo(304.8);
    });
  });

  describe("pixelToCell", () => {
    it("converts pixel coords to grid cell", () => {
      const grid = makeGrid();
      expect(grid.pixelToCell({ x: 0, y: 0 })).toEqual({ col: 0, row: 0 });
      expect(grid.pixelToCell({ x: 40, y: 80 })).toEqual({ col: 1, row: 2 });
      expect(grid.pixelToCell({ x: 55, y: 95 })).toEqual({ col: 1, row: 2 });
    });
  });

  describe("cellToPixel", () => {
    it("converts grid cell to pixel coords", () => {
      const grid = makeGrid();
      expect(grid.cellToPixel({ col: 0, row: 0 })).toEqual({ x: 0, y: 0 });
      expect(grid.cellToPixel({ col: 3, row: 5 })).toEqual({ x: 120, y: 200 });
    });
  });

  describe("snapPixelToGrid", () => {
    it("snaps pixel coords to nearest grid cell", () => {
      const grid = makeGrid();
      expect(grid.snapPixelToGrid({ x: 22, y: 38 })).toEqual({ x: 40, y: 40 });
      expect(grid.snapPixelToGrid({ x: 40, y: 80 })).toEqual({ x: 40, y: 80 });
    });
  });

  describe("isWithinCanvas", () => {
    it("returns true for coord within bounds", () => {
      const grid = makeGrid();
      expect(
        grid.isWithinCanvas({ col: 0, row: 0 }, { width: 5, height: 5 }),
      ).toBe(true);
      expect(
        grid.isWithinCanvas({ col: 45, row: 45 }, { width: 5, height: 5 }),
      ).toBe(true);
    });

    it("returns false when rect extends beyond canvas", () => {
      const grid = makeGrid();
      grid.cellSizePx.value = 40;
      // At 40px/cell, canvas is 100×100. col 98 + width 5 = 103 > 100
      expect(
        grid.isWithinCanvas({ col: 98, row: 98 }, { width: 5, height: 5 }),
      ).toBe(false);
    });

    it("returns false for negative coords", () => {
      const grid = makeGrid();
      expect(
        grid.isWithinCanvas({ col: -1, row: 0 }, { width: 1, height: 1 }),
      ).toBe(false);
    });
  });

  describe("roomToRect", () => {
    it("converts a room to a grid rect in imperial", () => {
      const grid = makeGrid();
      const rect = grid.roomToRect({
        x: 2,
        y: 3,
        widthCm: 304.8,
        depthCm: 609.6,
      });
      expect(rect).toEqual({ x: 2, y: 3, width: 10, height: 20 });
    });

    it("converts a room to a grid rect", () => {
      const grid = useGrid();
      const rect = grid.roomToRect({
        x: 0,
        y: 0,
        widthCm: 304.8,
        depthCm: 152.4,
      });
      expect(rect).toEqual({ x: 0, y: 0, width: 10, height: 5 });
    });
  });

  describe("canvas dimensions", () => {
    it("computes canvas pixel dimensions", () => {
      const grid = makeGrid();
      grid.cellSizePx.value = 40;
      // At 40px/cell: ceil(4000/40) = 100 cols/rows, capped at 200
      expect(grid.canvasWidthPx.value).toBe(100 * 40);
      expect(grid.canvasHeightPx.value).toBe(100 * 40);
    });
  });
});
