// /src/composables/canvas/use-selection.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSelection } from "@/composables/canvas/use-selection";
import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

vi.mock("@/stores/project");

const makeRoom = (id: string, groupId: string | null = null) => ({
  id,
  name: `Room ${id}`,
  type: "bedroom" as const,
  x: 0,
  y: 0,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId,
  fixtures: [],
});

describe("useSelection", () => {
  let mock: StoreMock;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    vi.mocked(useProjectStore).mockReturnValue(mock);
    // Reset singleton state between tests
    const { clearSelection } = useSelection();
    clearSelection();
  });

  describe("initial state", () => {
    it("has no selection", () => {
      const { hasSelection } = useSelection();
      expect(hasSelection.value).toBe(false);
    });

    it("isSingleSelection is false", () => {
      const { isSingleSelection } = useSelection();
      expect(isSingleSelection.value).toBe(false);
    });

    it("isMultiSelection is false", () => {
      const { isMultiSelection } = useSelection();
      expect(isMultiSelection.value).toBe(false);
    });
  });

  describe("select", () => {
    it("selects a single room", () => {
      const { select, isSelected, isSingleSelection } = useSelection();
      select("r1");
      expect(isSelected("r1")).toBe(true);
      expect(isSingleSelection.value).toBe(true);
    });

    it("replaces existing selection", () => {
      const { select, isSelected } = useSelection();
      select("r1");
      select("r2");
      expect(isSelected("r1")).toBe(false);
      expect(isSelected("r2")).toBe(true);
    });
  });

  describe("selectMany", () => {
    it("selects multiple rooms", () => {
      const { selectMany, isSelected, isMultiSelection } = useSelection();
      selectMany(["r1", "r2", "r3"]);
      expect(isSelected("r1")).toBe(true);
      expect(isSelected("r2")).toBe(true);
      expect(isSelected("r3")).toBe(true);
      expect(isMultiSelection.value).toBe(true);
    });
  });

  describe("shiftSelect", () => {
    it("adds a room to selection", () => {
      const { select, shiftSelect, isSelected } = useSelection();
      select("r1");
      shiftSelect("r2");
      expect(isSelected("r1")).toBe(true);
      expect(isSelected("r2")).toBe(true);
    });

    it("removes a room if already selected", () => {
      const { select, shiftSelect, isSelected } = useSelection();
      select("r1");
      shiftSelect("r1");
      expect(isSelected("r1")).toBe(false);
    });
  });

  describe("clearSelection", () => {
    it("clears all selected rooms", () => {
      const { select, clearSelection, hasSelection } = useSelection();
      select("r1");
      clearSelection();
      expect(hasSelection.value).toBe(false);
    });
  });

  describe("selectedRoom", () => {
    it("returns the room for single selection", () => {
      mock.rooms.rooms = [
        makeRoom("r1"),
      ] as unknown as StoreMock["rooms"]["rooms"];
      const { select, selectedRoom } = useSelection();
      select("r1");
      expect(selectedRoom.value?.id).toBe("r1");
    });

    it("returns undefined for multi-selection", () => {
      const { selectMany, selectedRoom } = useSelection();
      selectMany(["r1", "r2"]);
      expect(selectedRoom.value).toBeUndefined();
    });
  });

  describe("action availability", () => {
    it("canEdit is true for single selection", () => {
      const { select, canEdit } = useSelection();
      select("r1");
      expect(canEdit.value).toBe(true);
    });

    it("canEdit is false for multi-selection", () => {
      const { selectMany, canEdit } = useSelection();
      selectMany(["r1", "r2"]);
      expect(canEdit.value).toBe(false);
    });

    it("canCreateGroup is true for multi-selection", () => {
      const { selectMany, canCreateGroup } = useSelection();
      selectMany(["r1", "r2"]);
      expect(canCreateGroup.value).toBe(true);
    });

    it("canCreateGroup is false for single selection", () => {
      const { select, canCreateGroup } = useSelection();
      select("r1");
      expect(canCreateGroup.value).toBe(false);
    });

    it("canRemoveFromGroup is true when single grouped room selected", () => {
      mock.rooms.rooms = [
        makeRoom("r1", "g1"),
      ] as unknown as StoreMock["rooms"]["rooms"];
      const { select, canRemoveFromGroup } = useSelection();
      select("r1");
      expect(canRemoveFromGroup.value).toBe(true);
    });

    it("canRemoveFromGroup is false when room has no group", () => {
      mock.rooms.rooms = [
        makeRoom("r1"),
      ] as unknown as StoreMock["rooms"]["rooms"];
      const { select, canRemoveFromGroup } = useSelection();
      select("r1");
      expect(canRemoveFromGroup.value).toBe(false);
    });

    it("canMergeGroups is true when multiple groups selected", () => {
      mock.rooms.rooms = [
        makeRoom("r1", "g1"),
        makeRoom("r2", "g2"),
      ] as unknown as StoreMock["rooms"]["rooms"];
      const { selectMany, canMergeGroups } = useSelection();
      selectMany(["r1", "r2"]);
      expect(canMergeGroups.value).toBe(true);
    });

    it("allSelectedShareGroup is true when all selected rooms share a group", () => {
      mock.rooms.rooms = [
        makeRoom("r1", "g1"),
        makeRoom("r2", "g1"),
      ] as unknown as StoreMock["rooms"]["rooms"];
      const { selectMany, allSelectedShareGroup } = useSelection();
      selectMany(["r1", "r2"]);
      expect(allSelectedShareGroup.value).toBe(true);
    });
  });
});
