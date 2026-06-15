// /src/composables/canvas/use-project.ts

import { nowIso } from "@midden/stamp";
import { useRefHistory, useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { ref, watch } from "vue";

import type { Project, RoomGroup } from "@/types/project";
import type { UnitSystem } from "@/types/units";
import { downloadSvg } from "@/utils/svg";

import { useDeadSpace } from "./use-dead-space";
import { useFixtures } from "./use-fixtures";
import { useGrid } from "./use-grid";
import { useRooms } from "./use-rooms";

// --- Storage keys ---
const PROJECTS_KEY = "studs-projects";
const ACTIVE_ID_KEY = "studs-active-id";
const projectKey = (id: string) => `studs-project-${id}`;

// --- Types ---
export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

// --- Helpers ---
function createDefaultProject(): Project {
  const now = nowIso();

  return {
    id: uuidv4(),
    name: "Untitled Project",
    units: "imperial",
    rooms: [],
    groups: [],
    zoomLevel: 40,
    createdAt: now,
    updatedAt: now,
  };
}

function loadProjectFromStorage(id: string): Project | null {
  const raw = localStorage.getItem(projectKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export function useProject() {
  // --- Multi-project state ---
  const projectSummaries = useStorage<ProjectSummary[]>(PROJECTS_KEY, []);
  const activeId = useStorage<string | null>(ACTIVE_ID_KEY, null);

  // --- Per-project reactive state ---
  const units = ref<UnitSystem>("imperial");
  const projectName = ref("Untitled Project");
  const projectId = ref("");
  const createdAt = ref("");

  // --- Wire up composables ---
  const grid = useGrid();
  const roomsComposable = useRooms(grid);
  const fixtures = useFixtures();
  const deadSpace = useDeadSpace(grid, roomsComposable);
  const groups = ref<RoomGroup[]>([]);

  // --- Undo/redo ---
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory,
  } = useRefHistory(roomsComposable.rooms, { deep: true, capacity: 50 });

  // --- Core hydration ---
  function hydrateProject(project: Project) {
    projectId.value = project.id;
    projectName.value = project.name;
    units.value = project.units;
    roomsComposable.rooms.value = project.rooms;
    groups.value = project.groups;
    grid.cellSizePx.value = project.zoomLevel ?? 40;
    createdAt.value = project.createdAt;
    clearHistory();
  }

  function buildProjectData(): Project {
    return {
      id: projectId.value,
      name: projectName.value,
      units: units.value,
      rooms: roomsComposable.rooms.value,
      groups: groups.value,
      zoomLevel: grid.cellSizePx.value,
      createdAt: createdAt.value,
      updatedAt: nowIso(),
    };
  }

  function saveCurrentProject() {
    const data = buildProjectData();
    localStorage.setItem(projectKey(data.id), JSON.stringify(data));
    const summary: ProjectSummary = {
      id: data.id,
      name: data.name,
      updatedAt: data.updatedAt,
    };
    const idx = projectSummaries.value.findIndex((s) => s.id === data.id);
    if (idx >= 0) projectSummaries.value[idx] = summary;
    else projectSummaries.value.push(summary);
  }

  // --- Init: load active project or create default ---
  if (activeId.value) {
    const project = loadProjectFromStorage(activeId.value);
    if (project) {
      hydrateProject(project);
    } else {
      const fresh = createDefaultProject();
      hydrateProject(fresh);
      activeId.value = fresh.id;
      saveCurrentProject();
    }
  } else {
    const fresh = createDefaultProject();
    hydrateProject(fresh);
    activeId.value = fresh.id;
    saveCurrentProject();
  }

  // --- Auto-save on change ---
  watch(
    [projectName, units, roomsComposable.rooms, groups, grid.cellSizePx],
    () => saveCurrentProject(),
    { deep: true },
  );

  // --- Multi-project operations ---

  function newProject(): void {
    saveCurrentProject();
    const fresh = createDefaultProject();
    hydrateProject(fresh);
    activeId.value = fresh.id;
    saveCurrentProject();
  }

  function switchProject(id: string): void {
    if (id === projectId.value) return;
    saveCurrentProject();
    const project = loadProjectFromStorage(id);
    if (!project) return;
    hydrateProject(project);
    activeId.value = id;
  }

  function deleteProject(id: string): void {
    localStorage.removeItem(projectKey(id));
    projectSummaries.value = projectSummaries.value.filter((s) => s.id !== id);

    if (id === projectId.value) {
      const next = projectSummaries.value[0];
      if (next) {
        // Load next project directly without saving current (it's being deleted)
        const project = loadProjectFromStorage(next.id);
        if (project) {
          hydrateProject(project);
          activeId.value = next.id;
        }
      } else {
        const fresh = createDefaultProject();
        hydrateProject(fresh);
        activeId.value = fresh.id;
        saveCurrentProject();
      }
    }
  }

  // --- Groups ---

  function createGroup(name: string): RoomGroup {
    const group: RoomGroup = { id: uuidv4(), name };
    groups.value.push(group);
    return group;
  }

  function renameGroup(groupId: string, name: string): void {
    const group = groups.value.find((g) => g.id === groupId);
    if (group) group.name = name;
  }

  function deleteGroup(groupId: string, unassignRooms = true): void {
    groups.value = groups.value.filter((g) => g.id !== groupId);
    if (unassignRooms) {
      roomsComposable.roomsByGroup(groupId).forEach((r) => {
        roomsComposable.assignGroup(r.id, null);
      });
    }
  }

  function mergeGroups(groupIds: string[], newName: string): RoomGroup {
    const merged = createGroup(newName);
    groupIds.forEach((gid) => {
      roomsComposable.roomsByGroup(gid).forEach((r) => {
        roomsComposable.assignGroup(r.id, merged.id);
      });
      groups.value = groups.value.filter((g) => g.id !== gid);
    });
    return merged;
  }

  function removeFromGroup(roomId: string): void {
    const room = roomsComposable.roomById(roomId);
    if (!room?.groupId) return;

    const groupId = room.groupId;
    const members = roomsComposable.roomsByGroup(groupId);

    // Unassign the room
    roomsComposable.assignGroup(roomId, null);

    // If only one member remains, dissolve the group
    if (members.length <= 2) {
      const remaining = members.filter((r) => r.id !== roomId);
      remaining.forEach((r) => roomsComposable.assignGroup(r.id, null));
      groups.value = groups.value.filter((g) => g.id !== groupId);
    }
  }

  // --- Export / Import ---

  function exportJson(): void {
    const data = buildProjectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.value.toLowerCase().replace(/\s+/g, "-")}.studs.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as Project;
          hydrateProject(data);
          activeId.value = data.id;
          saveCurrentProject();
          resolve();
        } catch {
          reject(new Error("Invalid .studs.json file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  function exportSvg(): void {
    downloadSvg(buildProjectData(), deadSpace.allDeadSpaceCells.value);
  }

  return {
    // Project metadata
    projectId,
    projectName,
    units,
    createdAt,

    // Multi-project
    projectSummaries,
    activeId,
    switchProject,
    deleteProject,

    // Composables
    grid,
    rooms: roomsComposable,
    fixtures,
    deadSpace,
    groups,

    // Group management
    createGroup,
    renameGroup,
    deleteGroup,
    mergeGroups,
    removeFromGroup,

    // Persistence
    newProject,
    exportJson,
    importJson,
    exportSvg,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
