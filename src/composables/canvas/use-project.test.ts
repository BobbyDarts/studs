// /src/composables/canvas/use-project.test.ts

import type * as VueUseCore from "@vueuse/core";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

import { useProject } from "./use-project";

// --- localStorage mock ---
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// --- VueUse useStorage mock ---
vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof VueUseCore>("@vueuse/core");
  const { ref } = await import("vue");

  return {
    ...actual,

    useStorage: (key: string, defaultValue: unknown) => {
      const stored = localStorage.getItem(key);
      const val = stored ? JSON.parse(stored) : defaultValue;
      return ref(val);
    },
  };
});

describe("useProject", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("initialization", () => {
    it("creates a default project when nothing is stored", () => {
      const project = useProject();

      expect(project.projectName.value).toBe("Untitled Project");
      expect(project.units.value).toBe("imperial");
      expect(project.rooms.rooms.value).toHaveLength(0);
    });

    it("assigns a valid id on creation", () => {
      const project = useProject();

      expect(project.projectId.value).toBeTruthy();

      expect(project.projectId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("sets activeId on first init", () => {
      const project = useProject();

      expect(project.activeId.value).toBe(project.projectId.value);
    });

    it("adds project to summaries on first init", () => {
      const project = useProject();

      expect(project.projectSummaries.value).toHaveLength(1);

      expect(project.projectSummaries.value[0]!.id).toBe(
        project.projectId.value,
      );
    });

    it("sets default zoom level to 40", () => {
      const project = useProject();

      expect(project.grid.cellSizePx.value).toBe(40);
    });
  });

  describe("newProject", () => {
    it("creates a new project with default values", () => {
      const project = useProject();

      project.projectName.value = "Old Project";

      project.newProject();

      expect(project.projectName.value).toBe("Untitled Project");
    });

    it("adds the new project to summaries", () => {
      const project = useProject();

      project.newProject();

      expect(project.projectSummaries.value).toHaveLength(2);
    });

    it("updates activeId to new project", () => {
      const project = useProject();

      const oldId = project.projectId.value;

      project.newProject();

      expect(project.activeId.value).not.toBe(oldId);
      expect(project.activeId.value).toBe(project.projectId.value);
    });

    it("resets rooms on new project", () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      project.newProject();

      expect(project.rooms.rooms.value).toHaveLength(0);
    });

    it("clears undo history on new project", () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      project.newProject();

      expect(project.canUndo.value).toBe(false);
    });
  });

  describe("switchProject", () => {
    it("switches to an existing project", () => {
      const project = useProject();

      project.projectName.value = "Project A";

      project.newProject();

      const idA = project.projectSummaries.value[0]!.id;

      project.projectName.value = "Project B";

      project.switchProject(idA);

      expect(project.projectName.value).toBe("Project A");
    });

    it("does nothing when switching to current project", () => {
      const project = useProject();

      const id = project.projectId.value;

      project.projectName.value = "Changed";

      project.switchProject(id);

      expect(project.projectName.value).toBe("Changed");
    });

    it("updates activeId when switching", () => {
      const project = useProject();

      const firstId = project.projectId.value;

      project.newProject();

      project.switchProject(firstId);

      expect(project.activeId.value).toBe(firstId);
    });

    it("restores zoom level when switching", () => {
      const project = useProject();

      project.grid.cellSizePx.value = 60;

      const firstId = project.projectId.value;

      project.newProject();

      project.grid.cellSizePx.value = 20;

      project.switchProject(firstId);

      expect(project.grid.cellSizePx.value).toBe(60);
    });

    it("clears undo history when switching", () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      const firstId = project.projectId.value;

      project.newProject();

      project.switchProject(firstId);

      expect(project.canUndo.value).toBe(false);
    });
  });

  describe("deleteProject", () => {
    it("removes project from summaries", () => {
      const project = useProject();

      const firstId = project.projectId.value;

      project.newProject();

      project.deleteProject(firstId);

      expect(
        project.projectSummaries.value.find((s) => s.id === firstId),
      ).toBeUndefined();
    });

    it("removes project from localStorage", () => {
      const project = useProject();

      const firstId = project.projectId.value;

      project.newProject();

      project.deleteProject(firstId);

      expect(localStorage.getItem(`studs-project-${firstId}`)).toBeNull();
    });

    it("switches to another project when deleting active project", () => {
      const project = useProject();

      const firstId = project.projectId.value;

      project.newProject();

      const secondId = project.projectId.value;

      project.switchProject(firstId);

      project.deleteProject(firstId);

      expect(project.projectId.value).toBe(secondId);
    });

    it("creates new project when deleting last project", () => {
      const project = useProject();

      const id = project.projectId.value;

      project.deleteProject(id);

      expect(project.projectId.value).not.toBe(id);

      expect(project.projectSummaries.value).toHaveLength(1);

      expect(project.projectSummaries.value.some((s) => s.id === id)).toBe(
        false,
      );
    });
  });

  describe("hydrateProject / buildProjectData", () => {
    it("saves and restores zoom level", () => {
      const project = useProject();

      project.grid.cellSizePx.value = 75;

      const firstId = project.projectId.value;

      project.newProject();

      project.switchProject(firstId);

      expect(project.grid.cellSizePx.value).toBe(75);
    });

    it("saves and restores units", () => {
      const project = useProject();

      project.units.value = "metric";

      const firstId = project.projectId.value;

      project.newProject();

      project.switchProject(firstId);

      expect(project.units.value).toBe("metric");
    });

    it("saves and restores rooms", () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Kitchen",
        type: "kitchen",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      const firstId = project.projectId.value;

      project.newProject();

      project.switchProject(firstId);

      expect(project.rooms.rooms.value).toHaveLength(1);

      expect(project.rooms.rooms.value[0]!.name).toBe("Kitchen");
    });
  });

  describe("undo/redo", () => {
    it("canUndo is false initially", () => {
      const project = useProject();

      expect(project.canUndo.value).toBe(false);
    });

    it("canUndo is true after adding a room", async () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      await nextTick();

      expect(project.canUndo.value).toBe(true);
    });

    it("undo removes the added room", async () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      await nextTick();

      project.undo();

      await nextTick();

      expect(project.rooms.rooms.value).toHaveLength(0);
    });

    it("canRedo is true after undo", async () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      await nextTick();

      project.undo();

      await nextTick();

      expect(project.canRedo.value).toBe(true);
    });

    it("redo restores the room", async () => {
      const project = useProject();

      project.rooms.addRoom({
        name: "Test",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      await nextTick();

      project.undo();

      await nextTick();

      project.redo();

      await nextTick();

      expect(project.rooms.rooms.value).toHaveLength(1);
    });
  });

  describe("groups", () => {
    it("creates a group", () => {
      const project = useProject();

      const group = project.createGroup("Master Suite");

      expect(project.groups.value).toHaveLength(1);
      expect(group.name).toBe("Master Suite");
    });

    it("renames a group", () => {
      const project = useProject();

      const group = project.createGroup("Old Name");

      project.renameGroup(group.id, "New Name");

      expect(project.groups.value[0]!.name).toBe("New Name");
    });

    it("deletes a group and unassigns rooms", () => {
      const project = useProject();

      const group = project.createGroup("Suite");

      const room = project.rooms.addRoom({
        name: "Bedroom",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      project.deleteGroup(group.id);

      expect(project.groups.value).toHaveLength(0);

      expect(project.rooms.roomById(room.id)?.groupId).toBeNull();
    });

    it("can delete a group without unassigning rooms", () => {
      const project = useProject();

      const group = project.createGroup("Suite");

      const room = project.rooms.addRoom({
        name: "Bedroom",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      project.deleteGroup(group.id, false);

      expect(project.groups.value).toHaveLength(0);

      expect(project.rooms.roomById(room.id)?.groupId).toBe(group.id);
    });

    it("merges groups", () => {
      const project = useProject();

      const g1 = project.createGroup("Group 1");
      const g2 = project.createGroup("Group 2");

      project.rooms.addRoom({
        name: "Room A",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: g1.id,
      });

      project.rooms.addRoom({
        name: "Room B",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: g2.id,
      });

      const merged = project.mergeGroups([g1.id, g2.id], "Merged");

      expect(project.groups.value).toHaveLength(1);

      expect(
        project.rooms.rooms.value.every((r) => r.groupId === merged.id),
      ).toBe(true);
    });

    it("removeFromGroup unassigns only the selected room when group has more than two rooms", () => {
      const project = useProject();

      const group = project.createGroup("Suite");

      const a = project.rooms.addRoom({
        name: "A",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      const b = project.rooms.addRoom({
        name: "B",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      const c = project.rooms.addRoom({
        name: "C",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      project.removeFromGroup(a.id);

      expect(project.rooms.roomById(a.id)?.groupId).toBeNull();

      expect(project.rooms.roomById(b.id)?.groupId).toBe(group.id);

      expect(project.rooms.roomById(c.id)?.groupId).toBe(group.id);

      expect(project.groups.value).toHaveLength(1);
    });

    it("removeFromGroup dissolves the group when only one room would remain", () => {
      const project = useProject();

      const group = project.createGroup("Suite");

      const a = project.rooms.addRoom({
        name: "A",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      const b = project.rooms.addRoom({
        name: "B",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
        groupId: group.id,
      });

      project.removeFromGroup(a.id);

      expect(project.rooms.roomById(a.id)?.groupId).toBeNull();

      expect(project.rooms.roomById(b.id)?.groupId).toBeNull();

      expect(project.groups.value).toHaveLength(0);
    });

    it("removeFromGroup does nothing for ungrouped rooms", () => {
      const project = useProject();

      const room = project.rooms.addRoom({
        name: "Solo",
        type: "bedroom",
        widthCm: 304.8,
        depthCm: 304.8,
      });

      project.removeFromGroup(room.id);

      expect(project.rooms.roomById(room.id)?.groupId).toBeNull();
    });
  });
});
