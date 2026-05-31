// /src/test-utils/create-store-mock.ts

import { vi } from "vitest";
import { computed } from "vue";

import type { ProjectSummary } from "@/composables/canvas";
import type { useProjectStore } from "@/stores/project";
import type { WallKey } from "@/types/geometry";
import type { Room } from "@/types/project";
import type { UnitSystem } from "@/types/units";

export function createStoreMock() {
  return {
    units: "imperial" as UnitSystem,
    projectName: "Test Project",
    grid: {
      cellSizePx: 40,
      cols: 50,
      rows: 50,
      canvasWidthPx: 2000,
      canvasHeightPx: 2000,
      zoomPercent: computed(() => 100),
      zoom: vi.fn(),
      resetZoom: vi.fn(),
      fitToScreen: vi.fn(),
      cmPerCell: 30.48,
      cmToCells: vi.fn((cm: number) => cm / 30.48),
      cellsToCm: vi.fn((cells: number) => cells * 30.48),
      pixelToCell: vi.fn(),
      cellToPixel: vi.fn(),
      snapPixelToGrid: vi.fn(),
      snapCellToGrid: vi.fn(),
      isWithinCanvas: vi.fn(() => true),
      roomToRect: vi.fn(
        (room: { x: number; y: number; widthCm: number; depthCm: number }) => ({
          x: room.x,
          y: room.y,
          width: Math.round(room.widthCm / 30.48),
          height: Math.round(room.depthCm / 30.48),
        }),
      ),
    },
    rooms: {
      rooms: [],
      draggingId: null,
      addRoom: vi.fn(),
      updateRoom: vi.fn(),
      removeRoom: vi.fn(),
      roomById: vi.fn(),
      roomsByGroup: vi.fn(() => []),
      ungroupedRooms: [],
      canPlace: vi.fn(() => true),
      findFreePosition: vi.fn(() => ({ col: 0, row: 0 })),
      centerOnGrid: vi.fn(),
      startDrag: vi.fn(),
      moveDrag: vi.fn(),
      endDrag: vi.fn(),
      assignGroup: vi.fn(),
      moveGroup: vi.fn(),
      copyGroup: vi.fn(),
      rotateGroup: vi.fn(),
      startGroupDrag: vi.fn(),
      moveGroupDrag: vi.fn(),
      endGroupDrag: vi.fn(),
      mirrorRoom: vi.fn(),
      mirrorGroup: vi.fn(),
      boundingBoxOfRooms: { x: 0, y: 0, width: 0, height: 0 },
    },
    fixtures: {
      addFixture: vi.fn(),
      updateFixture: vi.fn(),
      removeFixture: vi.fn(),
      fixturesOnWall: vi.fn(() => []),
      validateFixtures: vi.fn(() => []),
      wallAcceptsFixtures: vi.fn<(room: Room, wall: WallKey) => boolean>(
        () => true,
      ),
    },
    deadSpace: {
      allDeadSpaceCells: [],
      enclosedCells: [],
      boundingBoxCells: [],
      enclosedAreaCm: 0,
      boundingBoxAreaCm: 0,
    },
    groups: [],
    // Add to the mock factory return:
    projectSummaries: [] as ProjectSummary[],
    activeId: null as string | null,
    switchProject: vi.fn<(id: string) => void>(),
    deleteProject: vi.fn<(id: string) => void>(),
    createGroup: vi.fn(),
    renameGroup: vi.fn(),
    deleteGroup: vi.fn(),
    mergeGroups: vi.fn(),
    newProject: vi.fn(),
    exportJson: vi.fn(),
    importJson: vi.fn(),
    exportSvg: vi.fn(),
    removeFromGroup: vi.fn(),
  };
}

export type StoreMock = ReturnType<typeof useProjectStore>;
