<!-- // /src/components/app/shell/floating-toolbar/FloatingToolbar.vue -->

<script setup lang="ts">
import {
  Combine,
  Copy,
  Crosshair,
  Expand,
  FlipHorizontal,
  FlipVertical,
  FolderMinus,
  FolderPlus,
  GripVertical,
  Group,
  LayoutList,
  LogOut,
  Maximize2,
  Pencil,
  PlusSquare,
  Redo2,
  RotateCw,
  Square,
  Trash2,
  Undo2,
  Wrench,
  ZoomIn,
  ZoomOut,
} from "@lucide/vue";
import {
  onKeyStroke,
  onClickOutside,
  useStorage,
  useResizeObserver,
} from "@vueuse/core";
import { ref, computed } from "vue";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSelection } from "@/composables/canvas";
import { useConfirmDialog, useGroupDialog } from "@/composables/ui";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/project";

const props = defineProps<{
  mainRef?: HTMLElement | null;
}>();

const emit = defineEmits<{
  "open-add-room": [];
  "open-edit-room": [];
  "open-add-fixture": [];
  "fit-to-screen": [];
  "center-on-grid": [];
  "reset-zoom": [];
}>();

const store = useProjectStore();
const selection = useSelection();
const { confirm, checkboxValue } = useConfirmDialog();
const { openGroupDialog } = useGroupDialog();

// --- Dragging ---
const toolbarRef = ref<HTMLElement | null>(null);
const position = useStorage("studs-toolbar-position", {
  x: 600,
  y: 600,
});
const isDragging = ref(false);
let dragOffset = { x: 0, y: 0 };

function onToolbarPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest("button")) return;
  isDragging.value = true;

  const bounds = props.mainRef?.getBoundingClientRect();
  const originX = bounds?.left ?? 0;
  const originY = bounds?.top ?? 0;

  dragOffset = {
    x: e.clientX - originX - position.value.x,
    y: e.clientY - originY - position.value.y,
  };

  function onMove(e: PointerEvent) {
    const bounds = props.mainRef?.getBoundingClientRect();
    const maxX = bounds ? bounds.width - 300 : window.innerWidth - 300;
    const maxY = bounds ? bounds.height - 48 : window.innerHeight - 48;
    const ox = bounds?.left ?? 0;
    const oy = bounds?.top ?? 0;

    position.value = {
      x: Math.max(0, Math.min(maxX, e.clientX - ox - dragOffset.x)),
      y: Math.max(0, Math.min(maxY, e.clientY - oy - dragOffset.y)),
    };
  }

  function onUp() {
    isDragging.value = false;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

// --- Active popover ---
const activePopover = ref<"zoom" | "room" | "group" | null>(null);

function togglePopover(name: "zoom" | "room" | "group") {
  activePopover.value = activePopover.value === name ? null : name;
}

function closePopover() {
  activePopover.value = null;
}

// Close on Escape
onKeyStroke("Escape", closePopover);

// Close on click outside
onClickOutside(toolbarRef, closePopover);

// --- Zoom actions ---
function onFitToScreen() {
  emit("fit-to-screen");
  closePopover();
}

function onCenterOnGrid() {
  emit("center-on-grid");
  closePopover();
}

function onResetZoom() {
  emit("reset-zoom");
  closePopover();
}

// --- Room actions ---
function onAddRoom() {
  emit("open-add-room");
  closePopover();
}

function onCopyRoom() {
  if (!selection.canEdit.value) return;
  const room = selection.selectedRoom.value;
  if (!room) return;
  const copy = store.rooms.addRoom({
    name: `${room.name} (copy)`,
    type: room.type,
    widthCm: room.widthCm,
    depthCm: room.depthCm,
    walls: { ...room.walls },
    groupId: room.groupId,
  });
  selection.select(copy.id);
  closePopover();
}

function onEditRoom() {
  if (!selection.canEdit.value) return;
  emit("open-edit-room");
  closePopover();
}

async function onDeleteRoom() {
  if (!selection.canDelete.value) return;
  const room = selection.selectedRoom.value;
  if (!room) return;
  const confirmed = await confirm({
    title: "Delete room?",
    description: `"${room.name}" and all its fixtures will be permanently removed.`,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "destructive",
  });
  if (!confirmed) return;
  store.rooms.removeRoom(room.id);
  selection.clearSelection();
  closePopover();
}

function onMirrorRoomH() {
  if (!selection.canMirrorRoom.value) return;
  const room = selection.selectedRoom.value;
  if (room) store.rooms.mirrorRoom(room.id, "horizontal");
}

function onMirrorRoomV() {
  if (!selection.canMirrorRoom.value) return;
  const room = selection.selectedRoom.value;
  if (room) store.rooms.mirrorRoom(room.id, "vertical");
}

function onAddFixture() {
  if (!selection.canAddFixture.value) return;
  emit("open-add-fixture");
  closePopover();
}

// --- Group actions ---
async function onCreateGroup() {
  if (!selection.canCreateGroup.value) return;
  const name = await openGroupDialog({ mode: "create" });
  if (!name) return;
  const ids = [...selection.selectedIds.value];
  const group = store.createGroup(name);
  ids.forEach((id) => store.rooms.assignGroup(id, group.id));
  closePopover();
}

async function onRenameGroup() {
  if (!selection.canRenameGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (!groupId) return;
  const initialName = store.groups.find((g) => g.id === groupId)?.name ?? "";
  const name = await openGroupDialog({ mode: "rename", initialName });
  if (!name) return;
  store.renameGroup(groupId, name);
  closePopover();
}

async function onRemoveFromGroup() {
  if (!selection.canRemoveFromGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (!groupId) return;
  const room = selection.selectedRoom.value;
  if (!room) return;
  const confirmed = await confirm({
    title: "Remove from group",
    description: `"${room.name}" will be permanently removed from group.`,
    confirmLabel: "Remove",
    cancelLabel: "Cancel",
    variant: "destructive",
  });
  if (!confirmed) return;
  store.removeFromGroup(room.id);
  selection.clearSelection();
  closePopover();
}

async function onDeleteGroup() {
  if (!selection.canDeleteGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (!groupId) return;
  const groupName =
    store.groups.find((g) => g.id === groupId)?.name ?? "this group";
  const confirmed = await confirm({
    title: "Delete group?",
    description: `"${groupName}" will be deleted. Rooms will become ungrouped.`,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "destructive",
    checkboxLabel: "Also delete all rooms and fixtures in this group",
    checkboxDefault: false,
  });
  if (!confirmed) return;
  const roomIds = store.rooms.roomsByGroup(groupId).map((r) => r.id);
  store.deleteGroup(groupId);

  if (checkboxValue.value) {
    roomIds.forEach((id) => store.rooms.removeRoom(id));
  }
  selection.clearSelection();
  closePopover();
}

function onCopyGroup() {
  if (!selection.canCopyGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (!groupId) return;
  const existingName =
    store.groups.find((g) => g.id === groupId)?.name ?? "Copy";
  const newGroup = store.createGroup(`${existingName} (copy)`);
  const copied = store.rooms.copyGroup(groupId, newGroup.id);
  selection.selectMany(copied.map((r) => r.id));
  closePopover();
}

function onRotateGroup() {
  if (!selection.canRotateGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (groupId) {
    store.rooms.rotateGroup(groupId, 90);
    emit("center-on-grid"); // scroll to keep group in view after rotation
  }
}

function onMirrorGroupH() {
  if (!selection.canRotateGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (groupId) store.rooms.mirrorGroup(groupId, "horizontal");
}

function onMirrorGroupV() {
  if (!selection.canRotateGroup.value) return;
  const groupId = [...selection.selectedGroupIds.value][0];
  if (groupId) store.rooms.mirrorGroup(groupId, "vertical");
}

async function onMergeGroups() {
  if (!selection.canMergeGroups.value) return;
  const groupIds = [...selection.selectedGroupIds.value];
  const name = await openGroupDialog({ mode: "merge", groupIds });
  if (!name) return;
  store.mergeGroups(groupIds, name);
  selection.clearSelection();
  closePopover();
}

const toolbarStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}));

const openUpward = computed(() => position.value.y > window.innerHeight / 2);

// Shared classes
const popoverClass = computed(() =>
  openUpward.value
    ? "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-popover border border-border rounded-lg shadow-lg p-1 flex flex-col gap-0.5 min-w-44 z-50"
    : "absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-popover border border-border rounded-lg shadow-lg p-1 flex flex-col gap-0.5 min-w-44 z-50",
);

function itemClass(enabled: boolean) {
  return [
    "flex items-center gap-2 px-2 py-1.5 text-sm rounded w-full text-left",
    enabled ? "hover:bg-muted" : "opacity-40 cursor-not-allowed",
  ];
}

// --- Groups panel ---
const groupsPanelVisible = useStorage("studs-groups-panel-visible", true);

// observers
useResizeObserver(
  computed(() => props.mainRef ?? null),
  (entries) => {
    const width = entries[0]?.contentRect.width ?? 0;
    const height = entries[0]?.contentRect.height ?? 0;
    position.value = {
      x: Math.max(0, Math.min(width - 300, position.value.x)),
      y: Math.max(0, Math.min(height - 48, position.value.y)),
    };
  },
);
</script>

<template>
  <TooltipProvider>
    <div
      ref="toolbarRef"
      :class="
        cn(
          // positioning
          'absolute z-40',

          // layout
          'flex items-center gap-1 px-2 py-1.5',

          // appearance
          'rounded-lg border',
          'bg-surface-floating/90 backdrop-blur-sm border-surface-floating-border shadow-floating',

          // behavior
          'select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )
      "
      :style="toolbarStyle"
      @pointerdown="onToolbarPointerDown"
    >
      <!-- Drag handle -->
      <GripVertical class="size-4 text-muted-foreground shrink-0 mr-0.5" />

      <div class="w-px h-5 bg-border mx-0.5" />

      <!-- Undo / Redo -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="sm"
            variant="ghost"
            class="h-8 w-8 p-0"
            :disabled="!store.canUndo"
            @click="store.undo()"
          >
            <Undo2 class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="sm"
            variant="ghost"
            class="h-8 w-8 p-0"
            :disabled="!store.canRedo"
            @click="store.redo()"
          >
            <Redo2 class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
      </Tooltip>

      <div class="w-px h-5 bg-border mx-0.5" />

      <!-- Zoom group -->
      <div class="relative">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="sm"
              variant="ghost"
              class="h-8 w-8 p-0"
              :class="activePopover === 'zoom' ? 'bg-muted' : ''"
              @click="togglePopover('zoom')"
            >
              <ZoomIn class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom</TooltipContent>
        </Tooltip>

        <div v-if="activePopover === 'zoom'" :class="popoverClass">
          <button :class="itemClass(true)" @click="store.grid.zoom(1)">
            <ZoomIn class="size-3.5 text-muted-foreground" />
            Zoom in
            <span class="ml-auto text-xs text-muted-foreground">+</span>
          </button>
          <button :class="itemClass(true)" @click="store.grid.zoom(-1)">
            <ZoomOut class="size-3.5 text-muted-foreground" />
            Zoom out
            <span class="ml-auto text-xs text-muted-foreground">-</span>
          </button>
          <button :class="itemClass(true)" @click="onResetZoom">
            <Maximize2 class="size-3.5 text-muted-foreground" />
            Reset zoom
            <span class="ml-auto text-xs text-muted-foreground">0</span>
          </button>
          <div class="h-px bg-border my-0.5" />
          <button :class="itemClass(true)" @click="onFitToScreen">
            <Expand class="size-3.5 text-muted-foreground" />
            Fit to screen
            <span class="ml-auto text-xs text-muted-foreground">F</span>
          </button>
          <button :class="itemClass(true)" @click="onCenterOnGrid">
            <Crosshair class="size-3.5 text-muted-foreground" />
            Center on grid
            <span class="ml-auto text-xs text-muted-foreground">C</span>
          </button>
        </div>
      </div>

      <!-- Room group -->
      <div class="relative">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="sm"
              variant="ghost"
              class="h-8 w-8 p-0"
              :class="activePopover === 'room' ? 'bg-muted' : ''"
              @click="togglePopover('room')"
            >
              <Square class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rooms</TooltipContent>
        </Tooltip>

        <div v-if="activePopover === 'room'" :class="popoverClass">
          <button :class="itemClass(true)" @click="onAddRoom">
            <PlusSquare class="size-3.5 text-muted-foreground" />
            Add room
            <span class="ml-auto text-xs text-muted-foreground">R</span>
          </button>
          <button
            :class="itemClass(selection.canEdit.value)"
            @click="onCopyRoom"
          >
            <Copy class="size-3.5 text-muted-foreground" />
            Copy room
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canEdit.value)"
            @click="onEditRoom"
          >
            <Pencil class="size-3.5 text-muted-foreground" />
            Edit room
          </button>
          <button
            :class="itemClass(selection.canDelete.value)"
            @click="onDeleteRoom"
          >
            <Trash2 class="size-3.5 text-muted-foreground" />
            Delete room
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canAddFixture.value)"
            @click="onAddFixture"
          >
            <Wrench class="size-3.5 text-muted-foreground" />
            Add fixture
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canMirrorRoom.value)"
            @click="onMirrorRoomH"
          >
            <FlipHorizontal class="size-3.5 text-muted-foreground" />
            Mirror horizontal
          </button>
          <button
            :class="itemClass(selection.canMirrorRoom.value)"
            @click="onMirrorRoomV"
          >
            <FlipVertical class="size-3.5 text-muted-foreground" />
            Mirror vertical
          </button>
        </div>
      </div>

      <!-- Group group -->
      <div class="relative">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="sm"
              variant="ghost"
              class="h-8 w-8 p-0"
              :class="activePopover === 'group' ? 'bg-muted' : ''"
              @click="togglePopover('group')"
            >
              <Group class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Groups</TooltipContent>
        </Tooltip>

        <div v-if="activePopover === 'group'" :class="popoverClass">
          <button
            :class="itemClass(selection.canCreateGroup.value)"
            @click="onCreateGroup"
          >
            <FolderPlus class="size-3.5 text-muted-foreground" />
            Create group
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canRenameGroup.value)"
            @click="onRenameGroup"
          >
            <Pencil class="size-3.5 text-muted-foreground" />
            Rename group
          </button>
          <button
            :class="itemClass(selection.canRemoveFromGroup.value)"
            @click="onRemoveFromGroup"
          >
            <LogOut class="size-3.5 text-muted-foreground" />
            Remove from group
          </button>
          <button
            :class="itemClass(selection.canDeleteGroup.value)"
            @click="onDeleteGroup"
          >
            <FolderMinus class="size-3.5 text-muted-foreground" />
            Delete group
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canCopyGroup.value)"
            @click="onCopyGroup"
          >
            <Copy class="size-3.5 text-muted-foreground" />
            Copy group
          </button>
          <button
            :class="itemClass(selection.canRotateGroup.value)"
            @click="onRotateGroup"
          >
            <RotateCw class="size-3.5 text-muted-foreground" />
            Rotate group
          </button>
          <button
            :class="itemClass(selection.canMirrorGroup.value)"
            @click="onMirrorGroupH"
          >
            <FlipHorizontal class="size-3.5 text-muted-foreground" />
            Mirror horizontal
          </button>
          <button
            :class="itemClass(selection.canMirrorGroup.value)"
            @click="onMirrorGroupV"
          >
            <FlipVertical class="size-3.5 text-muted-foreground" />
            Mirror vertical
          </button>
          <div class="h-px bg-border my-0.5" />
          <button
            :class="itemClass(selection.canMergeGroups.value)"
            @click="onMergeGroups"
          >
            <Combine class="size-3.5 text-muted-foreground" />
            Merge groups
          </button>
        </div>
      </div>

      <!-- Groups panel -->
      <div class="w-px h-5 bg-border mx-0.5" />

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="sm"
            variant="ghost"
            class="h-8 w-8 p-0"
            :class="groupsPanelVisible ? 'bg-muted' : ''"
            @click="groupsPanelVisible = !groupsPanelVisible"
          >
            <LayoutList class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Groups panel (G)</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>
