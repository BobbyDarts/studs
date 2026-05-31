// /src/utils/geometry.ts

import type { WallKey } from "@/types/geometry";

export interface Rect {
  x: number; // grid-cell column
  y: number; // grid-cell row
  width: number; // in grid cells
  height: number; // in grid cells
}

/** Returns true if two rects overlap (touching edges are NOT overlap) */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Returns true if two rects share an edge (are adjacent) */
export function rectsAdjacent(a: Rect, b: Rect): boolean {
  const xOverlap = a.x < b.x + b.width && a.x + a.width > b.x;
  const yOverlap = a.y < b.y + b.height && a.y + a.height > b.y;
  const xTouching = a.x + a.width === b.x || b.x + b.width === a.x;
  const yTouching = a.y + a.height === b.y || b.y + b.height === a.y;

  return (xOverlap && yTouching) || (yOverlap && xTouching);
}

/** Returns the bounding box that contains all provided rects */
export function boundingBox(rects: Rect[]): Rect {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Snaps a value to the nearest grid cell */
export function snapToGrid(value: number, cellSize: number): number {
  return Math.round(value / cellSize) * cellSize;
}

/** Returns which wall of a rect a point sits on, or null if it doesn't */
export function pointOnWall(
  point: { x: number; y: number },
  rect: Rect,
): WallKey | null {
  if (point.y === rect.y && point.x >= rect.x && point.x <= rect.x + rect.width)
    return "N";
  if (
    point.y === rect.y + rect.height &&
    point.x >= rect.x &&
    point.x <= rect.x + rect.width
  )
    return "S";
  if (
    point.x === rect.x &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
    return "W";
  if (
    point.x === rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
    return "E";
  return null;
}

/** Returns the offset (in grid cells) of a point along a given wall */
export function wallOffset(
  point: { x: number; y: number },
  rect: Rect,
  wall: WallKey,
): number {
  switch (wall) {
    case "N":
    case "S":
      return point.x - rect.x;
    case "E":
    case "W":
      return point.y - rect.y;
  }
}
