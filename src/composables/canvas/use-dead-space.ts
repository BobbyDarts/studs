// /src/composables/canvas/use-dead-space.ts

import { computed } from "vue";

import { boundingBox } from "@/utils/geometry";

import type { useGrid } from "./use-grid";
import type { useRooms } from "./use-rooms";

export type DeadSpaceType = "enclosed" | "bounding-box";

export interface DeadSpaceCell {
  x: number;
  y: number;
  type: DeadSpaceType;
}

export function useDeadSpace(
  grid: ReturnType<typeof useGrid>,
  roomsComposable: ReturnType<typeof useRooms>,
) {
  // Build a Set of occupied cell keys for fast lookup
  const occupiedCells = computed<Set<string>>(() => {
    const cells = new Set<string>();
    for (const room of roomsComposable.rooms.value) {
      const rect = grid.roomToRect(room);
      for (let row = rect.y; row < rect.y + rect.height; row++) {
        for (let col = rect.x; col < rect.x + rect.width; col++) {
          cells.add(`${col},${row}`);
        }
      }
    }
    return cells;
  });

  // --- Type A: enclosed gaps via flood-fill from canvas border ---

  const enclosedCells = computed<DeadSpaceCell[]>(() => {
    if (roomsComposable.rooms.value.length === 0) return [];

    const cols = grid.cols.value;
    const rows = grid.rows.value;
    const occupied = occupiedCells.value;
    const reachable = new Set<string>();
    const queue: [number, number][] = [];

    // Seed flood-fill from all border cells that aren't occupied
    for (let col = 0; col < cols; col++) {
      enqueue(col, 0);
      enqueue(col, rows - 1);
    }
    for (let row = 1; row < rows - 1; row++) {
      enqueue(0, row);
      enqueue(cols - 1, row);
    }

    function enqueue(col: number, row: number) {
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;

      const key = `${col},${row}`;
      if (!occupied.has(key) && !reachable.has(key)) {
        reachable.add(key);
        queue.push([col, row]);
      }
    }

    // BFS
    while (queue.length > 0) {
      const [col, row] = queue.shift()!;
      enqueue(col - 1, row);
      enqueue(col + 1, row);
      enqueue(col, row - 1);
      enqueue(col, row + 1);
    }

    // Any unoccupied, unreachable cell is enclosed dead space
    const result: DeadSpaceCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${col},${row}`;
        if (!occupied.has(key) && !reachable.has(key)) {
          result.push({ x: col, y: row, type: "enclosed" });
        }
      }
    }
    return result;
  });

  // --- Type B: bounding box remainder ---

  const boundingBoxCells = computed<DeadSpaceCell[]>(() => {
    if (roomsComposable.rooms.value.length === 0) return [];

    const box = boundingBox(
      roomsComposable.rooms.value.map((r) => grid.roomToRect(r)),
    );
    const occupied = occupiedCells.value;
    const result: DeadSpaceCell[] = [];

    for (let row = box.y; row < box.y + box.height; row++) {
      for (let col = box.x; col < box.x + box.width; col++) {
        const key = `${col},${row}`;
        if (!occupied.has(key)) {
          result.push({ x: col, y: row, type: "bounding-box" });
        }
      }
    }

    return result;
  });

  // --- Combined ---

  const allDeadSpaceCells = computed<DeadSpaceCell[]>(() => {
    const enclosedKeys = new Set(
      enclosedCells.value.map((c) => `${c.x},${c.y}`),
    );
    // Avoid duplicates — enclosed takes priority
    const bbOnly = boundingBoxCells.value.filter(
      (c) => !enclosedKeys.has(`${c.x},${c.y}`),
    );
    return [...enclosedCells.value, ...bbOnly];
  });

  const enclosedAreaCm = computed(
    () => enclosedCells.value.length * Math.pow(grid.cmPerCell, 2),
  );

  const boundingBoxAreaCm = computed(
    () => boundingBoxCells.value.length * Math.pow(grid.cmPerCell, 2),
  );

  return {
    allDeadSpaceCells,
    enclosedCells,
    boundingBoxCells,
    enclosedAreaCm,
    boundingBoxAreaCm,
  };
}
