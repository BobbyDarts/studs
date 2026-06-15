// /src/composables/canvas/use-grid.ts

import { computed, ref } from "vue";

import { snapToGrid, type Rect } from "@/utils/geometry";

const DEFAULT_CELL_SIZE = 40;
const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 120;
const ZOOM_FACTOR = 1.1;

// --- Types ---
export interface GridCoord {
  col: number;
  row: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

export function useGrid() {
  const cellSizePx = ref(DEFAULT_CELL_SIZE);
  const TARGET_CANVAS_PX = 4000;

  const cols = computed(() =>
    Math.min(200, Math.ceil(TARGET_CANVAS_PX / cellSizePx.value)),
  );
  const rows = computed(() =>
    Math.min(200, Math.ceil(TARGET_CANVAS_PX / cellSizePx.value)),
  );

  const canvasWidthPx = computed(() => cols.value * cellSizePx.value);
  const canvasHeightPx = computed(() => rows.value * cellSizePx.value);

  // --- Unit helpers ---

  /**
   * How many grid cells does a cm value span?
   * 1 cell = 1 ft (30.48 cm)
   */
  const cmPerCell = 30.48;

  function cmToCells(cm: number): number {
    return cm / cmPerCell;
  }

  function cellsToCm(cells: number): number {
    return cells * cmPerCell;
  }

  // --- Coordinate conversion ---

  function pixelToCell(px: PixelCoord): GridCoord {
    return {
      col: Math.floor(px.x / cellSizePx.value),
      row: Math.floor(px.y / cellSizePx.value),
    };
  }

  function cellToPixel(coord: GridCoord): PixelCoord {
    return {
      x: coord.col * cellSizePx.value,
      y: coord.row * cellSizePx.value,
    };
  }

  // --- Snapping ---

  function snapPixelToGrid(px: PixelCoord): PixelCoord {
    return {
      x: snapToGrid(px.x, cellSizePx.value),
      y: snapToGrid(px.y, cellSizePx.value),
    };
  }

  function snapCellToGrid(coord: GridCoord): GridCoord {
    return {
      col: Math.round(coord.col),
      row: Math.round(coord.row),
    };
  }

  // --- Bounds checking ---

  function isWithinCanvas(
    coord: GridCoord,
    rect?: { width: number; height: number },
  ): boolean {
    const w = rect?.width ?? 1;
    const h = rect?.height ?? 1;
    return (
      coord.col >= 0 &&
      coord.row >= 0 &&
      coord.col + w <= cols.value &&
      coord.row + h <= rows.value
    );
  }

  // --- Rect helpers ---

  /**
   * Converts a room's cm dimensions to a grid-cell Rect for geometry operations.
   */
  function roomToRect(room: {
    x: number;
    y: number;
    widthCm: number;
    depthCm: number;
  }): Rect {
    return {
      x: room.x,
      y: room.y,
      width: Math.round(cmToCells(room.widthCm)),
      height: Math.round(cmToCells(room.depthCm)),
    };
  }

  // --- Zoom ---

  function zoom(delta: number) {
    const next =
      delta > 0
        ? cellSizePx.value * ZOOM_FACTOR
        : cellSizePx.value / ZOOM_FACTOR;
    cellSizePx.value = Math.min(
      MAX_CELL_SIZE,
      Math.max(MIN_CELL_SIZE, Math.round(next * 10) / 10),
    );
  }

  function resetZoom() {
    cellSizePx.value = DEFAULT_CELL_SIZE;
  }

  function fitToScreen(
    viewportWidth: number,
    viewportHeight: number,
    roomsBoundingBox: Rect | null,
    padding = 80,
  ) {
    const box = roomsBoundingBox ?? { x: 0, y: 0, width: 10, height: 10 };
    const availW = viewportWidth - padding * 2;
    const availH = viewportHeight - padding * 2;
    const cellW = availW / box.width;
    const cellH = availH / box.height;
    const target = Math.min(cellW, cellH);
    cellSizePx.value = Math.min(
      MAX_CELL_SIZE,
      Math.max(MIN_CELL_SIZE, Math.round(target * 10) / 10),
    );
  }

  const zoomPercent = computed(() =>
    Math.round((cellSizePx.value / DEFAULT_CELL_SIZE) * 100),
  );

  return {
    // State
    cellSizePx,
    cols,
    rows,
    canvasWidthPx,
    canvasHeightPx,
    cmPerCell,

    // Conversion
    cmToCells,
    cellsToCm,
    pixelToCell,
    cellToPixel,

    // Snapping
    snapPixelToGrid,
    snapCellToGrid,

    // Bounds
    isWithinCanvas,

    // Rect
    roomToRect,

    zoom,
    resetZoom,
    fitToScreen,
    zoomPercent,
  };
}
