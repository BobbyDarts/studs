<!-- // /src/views/CanvasView.vue -->

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { ref, computed } from "vue";

import { FloorplanCanvas } from "@/components/app/canvas";
import { DeadSpaceOverlay } from "@/components/app/deadspace";
import { FixtureDialog, FixtureLayer } from "@/components/app/fixture";
import { RoomBlock, RoomDialog } from "@/components/app/room";
import {
  AppSidebar,
  FloatingToolbar,
  GlobalDialogs,
  GroupsPanel,
} from "@/components/app/shell";
import { useSelection } from "@/composables/canvas";
import { useKeyboardShortcuts } from "@/composables/keyboard";
import { useTheme } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";
import type { Room } from "@/types/project";
import { groupIndexToColor, groupIndexToColorDark } from "@/utils/group-colors";

const store = useProjectStore();
const { themeMode } = useTheme();

const selection = useSelection();

// --- Colors
function getGroupColor(room: Room): string | undefined {
  if (!room.groupId) return undefined;
  const index = store.groups.findIndex((g) => g.id === room.groupId);
  if (index === -1) return undefined;
  return themeMode.value === "dark"
    ? groupIndexToColorDark(index)
    : groupIndexToColor(index);
}

function getGroupName(room: Room): string | undefined {
  if (!room.groupId) return undefined;
  return store.groups.find((g) => g.id === room.groupId)?.name;
}

// --- Canvas ref ---
const floorplanCanvasRef = ref<{
  fitToScreen: () => void;
  scrollToCenter: () => void;
  centerOnGrid: () => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
} | null>(null);

const mainRef = ref<HTMLElement | null>(null);

// --- Keyboard shortcuts ---
useKeyboardShortcuts({
  openAddRoom,
  fitToScreen: () => floorplanCanvasRef.value?.fitToScreen(),
  centerOnGrid: () => floorplanCanvasRef.value?.centerOnGrid(),
  resetZoom: () => floorplanCanvasRef.value?.resetZoom(),
  zoomIn: () => floorplanCanvasRef.value?.zoomIn(),
  zoomOut: () => floorplanCanvasRef.value?.zoomOut(),
});

// --- Room dialog state ---
const roomDialogOpen = ref(false);
const editingRoomId = ref<string | null>(null);

const editingRoom = computed(() =>
  editingRoomId.value ? store.rooms.roomById(editingRoomId.value) : undefined,
);

function openAddRoom() {
  editingRoomId.value = null;
  roomDialogOpen.value = true;
}

function openEditRoom(id: string) {
  editingRoomId.value = id;
  roomDialogOpen.value = true;
}

// --- Fixture dialog state ---
const fixtureDialogOpen = ref(false);
const fixtureDialogRoomId = ref<string | null>(null);
const fixtureDialogFixtureId = ref<string | null>(null);

const fixtureDialogRoom = computed(() =>
  fixtureDialogRoomId.value
    ? store.rooms.roomById(fixtureDialogRoomId.value)
    : undefined,
);

const editingFixture = computed(() => {
  if (!fixtureDialogRoom.value || !fixtureDialogFixtureId.value)
    return undefined;
  return fixtureDialogRoom.value.fixtures.find(
    (f) => f.id === fixtureDialogFixtureId.value,
  );
});

function onAddFixture(roomId: string) {
  fixtureDialogRoomId.value = roomId;
  fixtureDialogFixtureId.value = null;
  fixtureDialogOpen.value = true;
}

function onEditFixture(roomId: string, fixtureId: string) {
  fixtureDialogRoomId.value = roomId;
  fixtureDialogFixtureId.value = fixtureId;
  fixtureDialogOpen.value = true;
}

// --- Selection ---
function onRoomSelect(id: string) {
  openEditRoom(id);
}

// --- Import/Export ---
const fileInputRef = ref<HTMLInputElement | null>(null);

function onImportClick() {
  fileInputRef.value?.click();
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    await store.importJson(file);
  } catch {
    // TODO: surface error via sonner toast
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

useEventListener(window, "studs:import", () => {
  fileInputRef.value?.click();
});

// --- Groups panel ---
function onGoToGroup(groupId: string) {
  const rooms = store.rooms.roomsByGroup(groupId);
  if (rooms.length === 0) return;
  // Select the group rooms then center on them
  selection.selectMany(rooms.map((r) => r.id));
  floorplanCanvasRef.value?.fitToScreen();
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Left sidebar -->
    <AppSidebar @import-click="onImportClick" />

    <!-- Canvas area -->
    <main ref="mainRef" class="relative flex flex-1 overflow-hidden">
      <FloorplanCanvas
        ref="floorplanCanvasRef"
        @click-canvas="selection.clearSelection()"
      >
        <template #default>
          <DeadSpaceOverlay />

          <RoomBlock
            v-for="room in store.rooms.rooms"
            :key="room.id"
            :room="room"
            :selected="selection.isSelected(room.id)"
            :group-color="getGroupColor(room)"
            :group-name="getGroupName(room)"
            @select="selection.select"
            @shift-select="selection.shiftSelect"
            @open-edit="onRoomSelect"
            @add-fixture="onAddFixture"
          />

          <FixtureLayer :key="'fixture-layer'" @edit-fixture="onEditFixture" />
        </template>
      </FloorplanCanvas>

      <FloatingToolbar
        :main-ref="mainRef"
        @open-add-room="openAddRoom"
        @open-edit-room="
          selection.selectedRoom.value &&
          openEditRoom(selection.selectedRoom.value.id)
        "
        @open-add-fixture="
          selection.selectedRoom.value &&
          onAddFixture(selection.selectedRoom.value.id)
        "
        @fit-to-screen="floorplanCanvasRef?.fitToScreen()"
        @center-on-grid="floorplanCanvasRef?.centerOnGrid()"
        @reset-zoom="floorplanCanvasRef?.resetZoom()"
      />

      <GroupsPanel :main-ref="mainRef" @go-to-group="onGoToGroup" />
    </main>
  </div>

  <!-- Room dialog -->
  <RoomDialog v-model:open="roomDialogOpen" :room="editingRoom" />

  <!-- Fixture dialog -->
  <FixtureDialog
    v-model:open="fixtureDialogOpen"
    :room="fixtureDialogRoom"
    :fixture="editingFixture"
  />

  <input
    ref="fileInputRef"
    type="file"
    accept=".json,.studs.json"
    class="hidden"
    @change="onFileChange"
  />

  <GlobalDialogs />
</template>
