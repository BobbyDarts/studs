// /src/composables/canvas/use-selection.ts

import { computed, ref } from "vue";

import { useProjectStore } from "@/stores/project";

const selectedIds = ref<Set<string>>(new Set());

export function useSelection() {
  const store = useProjectStore();

  const selectedRooms = computed(() =>
    store.rooms.rooms.filter((r) => selectedIds.value.has(r.id)),
  );

  const hasSelection = computed(() => selectedIds.value.size > 0);
  const isSingleSelection = computed(() => selectedIds.value.size === 1);
  const isMultiSelection = computed(() => selectedIds.value.size > 1);

  const selectedRoom = computed(() =>
    isSingleSelection.value ? selectedRooms.value[0] : undefined,
  );

  // Group state of current selection
  const selectedGroupIds = computed(() => {
    const ids = new Set<string>();
    selectedRooms.value.forEach((r) => {
      if (r.groupId) ids.add(r.groupId);
    });
    return ids;
  });

  const allSelectedAreGrouped = computed(() =>
    selectedRooms.value.every((r) => r.groupId !== null),
  );

  const allSelectedShareGroup = computed(
    () => selectedGroupIds.value.size === 1 && allSelectedAreGrouped.value,
  );

  const hasMultipleGroups = computed(() => selectedGroupIds.value.size > 1);

  // What actions are available
  const canEdit = computed(() => isSingleSelection.value);
  const canDelete = computed(() => isSingleSelection.value);
  const canMirrorRoom = computed(() => isSingleSelection.value);
  const canAddFixture = computed(() => isSingleSelection.value);
  const canCreateGroup = computed(() => isMultiSelection.value);
  const canRenameGroup = computed(
    () => hasSelection.value && allSelectedShareGroup.value,
  );
  const canRemoveFromGroup = computed(
    () => isSingleSelection.value && !!selectedRoom.value?.groupId,
  );
  const canDeleteGroup = computed(
    () => hasSelection.value && allSelectedShareGroup.value,
  );
  const canMoveGroup = computed(() => allSelectedShareGroup.value);
  const canCopyGroup = computed(() => allSelectedShareGroup.value);
  const canRotateGroup = computed(() => allSelectedShareGroup.value);
  const canMirrorGroup = computed(() => allSelectedShareGroup.value);
  const canMergeGroups = computed(() => hasMultipleGroups.value);

  // Selection operations
  function select(id: string) {
    selectedIds.value = new Set([id]);
  }

  function selectMany(ids: string[]) {
    selectedIds.value = new Set(ids);
  }

  function shiftSelect(id: string) {
    const next = new Set(selectedIds.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedIds.value = next;
  }

  function clearSelection() {
    selectedIds.value = new Set();
  }

  function isSelected(id: string) {
    return selectedIds.value.has(id);
  }

  return {
    selectedIds,
    selectedRooms,
    selectedRoom,
    hasSelection,
    isSingleSelection,
    isMultiSelection,
    selectedGroupIds,
    allSelectedShareGroup,
    hasMultipleGroups,

    // Available actions
    canEdit,
    canDelete,
    canMirrorRoom,
    canAddFixture,
    canCreateGroup,
    canRenameGroup,
    canRemoveFromGroup,
    canDeleteGroup,
    canMoveGroup,
    canCopyGroup,
    canRotateGroup,
    canMirrorGroup,
    canMergeGroups,

    // Operations
    select,
    selectMany,
    shiftSelect,
    clearSelection,
    isSelected,
  };
}
