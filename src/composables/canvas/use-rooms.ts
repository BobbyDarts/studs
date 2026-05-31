// /src/composables/canvas/use-rooms.ts

import { v4 as uuidv4 } from "uuid";
import { ref, computed } from "vue";

import type { Fixture } from "@/types/fixtures";
import type { RotationDegrees } from "@/types/geometry";
import type { Room, RoomType, RoomWalls } from "@/types/project";
import { rectsOverlap, boundingBox } from "@/utils/geometry";

import type { useGrid } from "./use-grid";

const DEFAULT_WALLS: RoomWalls = {
  N: "solid",
  S: "solid",
  E: "solid",
  W: "solid",
};

function rotateFixture90(fixture: Fixture): void {
  const wallMap: Record<string, "N" | "S" | "E" | "W"> = {
    N: "E",
    E: "S",
    S: "W",
    W: "N",
  };
  fixture.wall = wallMap[fixture.wall] ?? fixture.wall;
}

export function useRooms(grid: ReturnType<typeof useGrid>) {
  const rooms = ref<Room[]>([]);

  // --- Queries ---

  const roomById = (id: string) => rooms.value.find((r) => r.id === id);

  const roomsByGroup = (groupId: string) =>
    rooms.value.filter((r) => r.groupId === groupId);

  const ungroupedRooms = computed(() =>
    rooms.value.filter((r) => r.groupId === null),
  );

  const boundingBoxOfRooms = computed(() =>
    boundingBox(rooms.value.map((r) => grid.roomToRect(r))),
  );

  // --- CRUD ---

  function addRoom(params: {
    name: string;
    type: RoomType;
    widthCm: number;
    depthCm: number;
    walls?: Partial<RoomWalls>;
    groupId?: string | null;
  }): Room {
    const walls: RoomWalls = { ...DEFAULT_WALLS, ...params.walls };
    const position = findFreePosition(params.widthCm, params.depthCm);

    const room: Room = {
      id: uuidv4(),
      name: params.name,
      type: params.type,
      x: position.col,
      y: position.row,
      widthCm: params.widthCm,
      depthCm: params.depthCm,
      walls,
      groupId: params.groupId ?? null,
      fixtures: [],
    };

    rooms.value.push(room);
    return room;
  }

  function updateRoom(
    id: string,
    updates: Partial<Omit<Room, "id" | "fixtures">>,
  ): void {
    const room = roomById(id);
    if (!room) return;
    Object.assign(room, updates);
  }

  function removeRoom(id: string): void {
    rooms.value = rooms.value.filter((r) => r.id !== id);
  }

  function mirrorRoom(roomId: string, axis: "horizontal" | "vertical"): void {
    const room = roomById(roomId);
    if (!room) return;

    if (axis === "horizontal") {
      // Swap E/W wall boundaries
      const tmpE = room.walls.E;
      room.walls.E = room.walls.W;
      room.walls.W = tmpE;

      // E/W fixtures swap walls, offset unchanged
      // N/S fixtures stay on same wall, offset flips (horizontal flip reverses E-W direction)
      room.fixtures.forEach((f) => {
        if (f.wall === "E") {
          f.wall = "W";
        } else if (f.wall === "W") {
          f.wall = "E";
        } else if (f.wall === "N" || f.wall === "S") {
          // N/S wall offsets run along width — flip them
          f.offsetCm = room.widthCm - f.offsetCm;
        }
      });
    } else {
      // Swap N/S wall boundaries
      const tmpN = room.walls.N;
      room.walls.N = room.walls.S;
      room.walls.S = tmpN;

      // N/S fixtures swap walls, offset unchanged
      // E/W fixtures stay on same wall, offset flips (vertical flip reverses N-S direction)
      room.fixtures.forEach((f) => {
        if (f.wall === "N") {
          f.wall = "S";
        } else if (f.wall === "S") {
          f.wall = "N";
        } else if (f.wall === "E" || f.wall === "W") {
          // E/W wall offsets run along depth — flip them
          f.offsetCm = room.depthCm - f.offsetCm;
        }
      });
    }
  }

  // --- Placement ---

  function findFreePosition(
    widthCm: number,
    depthCm: number,
  ): { col: number; row: number } {
    const w = Math.round(grid.cmToCells(widthCm));
    const h = Math.round(grid.cmToCells(depthCm));

    // Start search near existing rooms if any exist
    const startCol =
      rooms.value.length > 0
        ? Math.max(0, boundingBoxOfRooms.value.x - w - 1)
        : 0;
    const startRow = rooms.value.length > 0 ? boundingBoxOfRooms.value.y : 0;

    // Spiral outward from the bounding box rather than always starting at origin
    for (let row = startRow; row + h <= grid.rows.value; row++) {
      for (let col = startCol; col + w <= grid.cols.value; col++) {
        const candidate = { x: col, y: row, width: w, height: h };
        const overlaps = rooms.value.some((r) =>
          rectsOverlap(candidate, grid.roomToRect(r)),
        );
        if (!overlaps) return { col, row };
      }
      // If we didn't find a spot starting from startCol, try from 0
      if (startCol > 0) {
        for (let col = 0; col < startCol; col++) {
          const candidate = { x: col, y: row, width: w, height: h };
          const overlaps = rooms.value.some((r) =>
            rectsOverlap(candidate, grid.roomToRect(r)),
          );
          if (!overlaps) return { col, row };
        }
      }
    }

    return { col: 0, row: 0 };
  }

  function canPlace(
    widthCm: number,
    depthCm: number,
    col: number,
    row: number,
    excludeId?: string,
  ): boolean {
    const w = Math.round(grid.cmToCells(widthCm));
    const h = Math.round(grid.cmToCells(depthCm));
    const candidate = { x: col, y: row, width: w, height: h };

    if (!grid.isWithinCanvas({ col, row }, { width: w, height: h }))
      return false;

    return !rooms.value
      .filter((r) => r.id !== excludeId)
      .some((r) => rectsOverlap(candidate, grid.roomToRect(r)));
  }

  function centerOnGrid(): void {
    if (rooms.value.length === 0) return;

    const box = boundingBox(rooms.value.map((r) => grid.roomToRect(r)));
    const gridCenter = Math.floor(grid.cols.value / 2);
    const boxCenterCol = Math.floor(box.x + box.width / 2);
    const boxCenterRow = Math.floor(box.y + box.height / 2);
    const deltaCol = gridCenter - boxCenterCol;
    const deltaRow = gridCenter - boxCenterRow;

    rooms.value.forEach((r) => {
      r.x = Math.max(
        0,
        Math.min(grid.cols.value - grid.roomToRect(r).width, r.x + deltaCol),
      );
      r.y = Math.max(
        0,
        Math.min(grid.rows.value - grid.roomToRect(r).height, r.y + deltaRow),
      );
    });
  }

  // --- Drag ---

  const draggingId = ref<string | null>(null);
  const dragOffset = ref<{ col: number; row: number }>({ col: 0, row: 0 });

  function startDrag(
    roomId: string,
    pointerCol: number,
    pointerRow: number,
  ): void {
    const room = roomById(roomId);
    if (!room) return;
    draggingId.value = roomId;
    dragOffset.value = {
      col: pointerCol - room.x,
      row: pointerRow - room.y,
    };
  }

  function moveDrag(pointerCol: number, pointerRow: number): void {
    if (!draggingId.value) return;
    const room = roomById(draggingId.value);
    if (!room) return;

    const targetCol = pointerCol - dragOffset.value.col;
    const targetRow = pointerRow - dragOffset.value.row;

    // Allow free movement — clamp to canvas bounds only
    const w = Math.round(grid.cmToCells(room.widthCm));
    const h = Math.round(grid.cmToCells(room.depthCm));
    room.x = Math.max(0, Math.min(grid.cols.value - w, targetCol));
    room.y = Math.max(0, Math.min(grid.rows.value - h, targetRow));
  }

  function endDrag(): void {
    if (!draggingId.value) return;
    const room = roomById(draggingId.value);
    if (room) {
      snapToNearestValid(room);
    }
    draggingId.value = null;
    dragOffset.value = { col: 0, row: 0 };
  }

  function snapToNearestValid(room: Room): void {
    const w = Math.round(grid.cmToCells(room.widthCm));
    const h = Math.round(grid.cmToCells(room.depthCm));

    // If current position is valid, keep it
    if (canPlace(room.widthCm, room.depthCm, room.x, room.y, room.id)) return;

    // Search outward from current position in a spiral
    const startX = room.x;
    const startY = room.y;
    let bestCol = room.x;
    let bestRow = room.y;
    let bestDist = Infinity;

    // Search within a reasonable radius
    const radius = Math.max(grid.cols.value, grid.rows.value);
    for (let r = 1; r <= radius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const col = startX + dx;
          const row = startY + dy;
          if (
            col < 0 ||
            row < 0 ||
            col + w > grid.cols.value ||
            row + h > grid.rows.value
          )
            continue;
          if (canPlace(room.widthCm, room.depthCm, col, row, room.id)) {
            const dist = Math.abs(dx) + Math.abs(dy);
            if (dist < bestDist) {
              bestDist = dist;
              bestCol = col;
              bestRow = row;
            }
          }
        }
      }
      // Stop once we've found a valid position at this radius
      if (bestDist <= r * 2) break;
    }

    room.x = bestCol;
    room.y = bestRow;
  }

  // --- Groups ---

  function assignGroup(roomId: string, groupId: string | null): void {
    const room = roomById(roomId);
    if (!room) return;
    room.groupId = groupId;
  }

  function moveGroup(
    groupId: string,
    deltaCol: number,
    deltaRow: number,
  ): void {
    const group = roomsByGroup(groupId);
    if (group.length === 0) return;

    // Compute future rects for all rooms in the group
    const futureRects = group.map((r) => {
      const rect = grid.roomToRect(r);
      return {
        id: r.id,
        rect: {
          ...rect,
          x: r.x + deltaCol,
          y: r.y + deltaRow,
        },
      };
    });

    const canMoveAll = futureRects.every(({ rect }) => {
      // 1. Bounds check
      if (
        !grid.isWithinCanvas(
          { col: rect.x, row: rect.y },
          { width: rect.width, height: rect.height },
        )
      ) {
        return false;
      }

      // 2. Collision check against NON-group rooms only
      return !rooms.value
        .filter((r) => r.groupId !== groupId)
        .some((r) => rectsOverlap(rect, grid.roomToRect(r)));
    });

    if (!canMoveAll) return;

    // Apply movement
    group.forEach((r) => {
      r.x += deltaCol;
      r.y += deltaRow;
    });
  }

  function copyGroup(
    groupId: string,
    newGroupId: string,
    deltaCol?: number,
    deltaRow?: number,
  ): Room[] {
    const group = roomsByGroup(groupId);
    if (group.length === 0) return [];

    const box = boundingBox(group.map((r) => grid.roomToRect(r)));
    const offsetCol = deltaCol ?? box.width + 2;
    const offsetRow = deltaRow ?? 0;

    return group.map((r) => {
      const copy: Room = {
        ...r,
        id: uuidv4(),
        groupId: newGroupId,
        x: r.x + offsetCol,
        y: r.y + offsetRow,
        fixtures: r.fixtures.map((f) => ({ ...f, id: uuidv4() })),
      };
      rooms.value.push(copy);
      return copy;
    });
  }

  function rotateGroup(groupId: string, degrees: RotationDegrees = 180): void {
    const group = roomsByGroup(groupId);
    if (group.length === 0) return;

    const box = boundingBox(group.map((r) => grid.roomToRect(r)));

    // Compute all new positions first
    const updates = group.map((r) => {
      const rect = grid.roomToRect(r);
      let newX: number;
      let newY: number;
      let newWidthCm = r.widthCm;
      let newDepthCm = r.depthCm;

      switch (degrees) {
        case 90:
          newX = box.x + box.height - (rect.y - box.y) - rect.height;
          newY = box.y + (rect.x - box.x);
          newWidthCm = r.depthCm;
          newDepthCm = r.widthCm;
          break;
        case 180:
          newX = box.x + box.width - (rect.x - box.x) - rect.width;
          newY = box.y + box.height - (rect.y - box.y) - rect.height;
          break;
        case 270:
          newX = box.x + (rect.y - box.y);
          newY = box.y + box.width - (rect.x - box.x) - rect.width;
          newWidthCm = r.depthCm;
          newDepthCm = r.widthCm;
          break;
        default:
          newX = rect.x;
          newY = rect.y;
      }

      return { room: r, newX, newY, newWidthCm, newDepthCm };
    });

    // Find minimum x/y to clamp entire group if any room goes out of bounds
    const minX = Math.min(...updates.map((u) => u.newX));
    const minY = Math.min(...updates.map((u) => u.newY));
    const clampX = minX < 0 ? -minX : 0;
    const clampY = minY < 0 ? -minY : 0;

    // Apply
    updates.forEach(({ room: r, newX, newY, newWidthCm, newDepthCm }) => {
      r.x = newX + clampX;
      r.y = newY + clampY;
      r.widthCm = newWidthCm;
      r.depthCm = newDepthCm;
      const rotations = degrees === 90 ? 1 : degrees === 180 ? 2 : 3;
      for (let i = 0; i < rotations; i++) {
        r.fixtures.forEach((f) => rotateFixture90(f));
      }
    });
  }

  function mirrorGroup(groupId: string, axis: "horizontal" | "vertical"): void {
    const group = roomsByGroup(groupId);
    if (group.length === 0) return;

    const box = boundingBox(group.map((r) => grid.roomToRect(r)));

    group.forEach((r) => {
      const rect = grid.roomToRect(r);

      if (axis === "horizontal") {
        r.x = box.x + box.width - (rect.x - box.x) - rect.width;

        const tmpE = r.walls.E;
        r.walls.E = r.walls.W;
        r.walls.W = tmpE;

        r.fixtures.forEach((f) => {
          if (f.wall === "E") {
            f.wall = "W";
          } else if (f.wall === "W") {
            f.wall = "E";
          } else if (f.wall === "N" || f.wall === "S") {
            f.offsetCm = r.widthCm - f.offsetCm;
          }
        });
      } else {
        r.y = box.y + box.height - (rect.y - box.y) - rect.height;

        const tmpN = r.walls.N;
        r.walls.N = r.walls.S;
        r.walls.S = tmpN;

        r.fixtures.forEach((f) => {
          if (f.wall === "N") {
            f.wall = "S";
          } else if (f.wall === "S") {
            f.wall = "N";
          } else if (f.wall === "E" || f.wall === "W") {
            f.offsetCm = r.depthCm - f.offsetCm;
          }
        });
      }
    });
  }

  // --- Group Drag ---
  const groupDragState = ref<{
    groupId: string;
    lastCol: number;
    lastRow: number;
  } | null>(null);

  function startGroupDrag(groupId: string, col: number, row: number): void {
    groupDragState.value = { groupId, lastCol: col, lastRow: row };
  }

  function moveGroupDrag(col: number, row: number): void {
    if (!groupDragState.value) return;
    const deltaCol = col - groupDragState.value.lastCol;
    const deltaRow = row - groupDragState.value.lastRow;
    if (deltaCol === 0 && deltaRow === 0) return;

    const group = roomsByGroup(groupDragState.value.groupId);

    // Free movement — clamp to canvas bounds only
    const canMoveAll = group.every((r) => {
      const rect = grid.roomToRect(r);
      const newX = r.x + deltaCol;
      const newY = r.y + deltaRow;
      return (
        newX >= 0 &&
        newY >= 0 &&
        newX + rect.width <= grid.cols.value &&
        newY + rect.height <= grid.rows.value
      );
    });

    if (canMoveAll) {
      group.forEach((r) => {
        r.x += deltaCol;
        r.y += deltaRow;
      });
      groupDragState.value.lastCol = col;
      groupDragState.value.lastRow = row;
    }
  }

  function endGroupDrag(): void {
    if (!groupDragState.value) return;
    const group = roomsByGroup(groupDragState.value.groupId);
    snapGroupToNearestValid(groupDragState.value.groupId, group);
    groupDragState.value = null;
  }

  function snapGroupToNearestValid(groupId: string, group: Room[]): void {
    // Check if current position is valid for all rooms
    const allValid = group.every((r) =>
      canPlace(r.widthCm, r.depthCm, r.x, r.y, r.id),
    );
    if (allValid) return;

    // Try increasing offsets until all rooms fit
    for (let r = 1; r <= 50; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const fits = group.every((room) => {
            const rect = grid.roomToRect(room);
            const newX = room.x + dx;
            const newY = room.y + dy;
            if (
              newX < 0 ||
              newY < 0 ||
              newX + rect.width > grid.cols.value ||
              newY + rect.height > grid.rows.value
            )
              return false;
            return !rooms.value
              .filter(
                (other) => other.groupId !== groupId && !group.includes(other),
              )
              .some((other) =>
                rectsOverlap(
                  { x: newX, y: newY, width: rect.width, height: rect.height },
                  grid.roomToRect(other),
                ),
              );
          });
          if (fits) {
            group.forEach((room) => {
              room.x += dx;
              room.y += dy;
            });
            return;
          }
        }
      }
    }
  }

  return {
    rooms,
    ungroupedRooms,
    boundingBoxOfRooms,
    draggingId,

    // Queries
    roomById,
    roomsByGroup,

    // CRUD
    addRoom,
    updateRoom,
    removeRoom,
    mirrorRoom,

    // Placement
    canPlace,
    findFreePosition,
    centerOnGrid,

    // Drag
    startDrag,
    moveDrag,
    endDrag,

    // Groups
    assignGroup,
    moveGroup,
    copyGroup,
    rotateGroup,
    mirrorGroup,

    // Group Drag
    startGroupDrag,
    moveGroupDrag,
    endGroupDrag,
  };
}
