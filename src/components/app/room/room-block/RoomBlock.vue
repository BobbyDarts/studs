<!-- // /src/components/app/room/room-block/RoomBlock.vue -->

<script setup lang="ts">
import { computed, inject, type Ref } from "vue";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { RoomLabel } from "@/components/app/room";
import { useProjectStore } from "@/stores/project";
import type { WallKey } from "@/types/geometry";
import type { Room } from "@/types/project";

const props = defineProps<{
  room: Room;
  selected: boolean;
  groupName?: string;
  groupColor?: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  "shift-select": [id: string];
  "open-edit": [id: string];
  "add-fixture": [roomId: string];
}>();

const store = useProjectStore();
const { grid, rooms } = store;

const canvasInnerRef = inject<Ref<HTMLElement | null>>("canvasInnerRef");

const positionStyle = computed(() => {
  const w = Math.round(grid.cmToCells(props.room.widthCm));
  const h = Math.round(grid.cmToCells(props.room.depthCm));
  return {
    left: `${props.room.x * grid.cellSizePx}px`,
    top: `${props.room.y * grid.cellSizePx}px`,
    width: `${w * grid.cellSizePx}px`,
    height: `${h * grid.cellSizePx}px`,
  };
});

const isDragging = computed(() => rooms.draggingId === props.room.id);

const WALL_SOLID = "2px solid var(--wall-color)";
const WALL_VIRTUAL = "1px dashed var(--wall-virtual)";
const WALL_OPEN = "none";

function wallStyle(wall: WallKey): string {
  const boundary = props.room.walls[wall];
  if (boundary === "solid") return WALL_SOLID;
  if (boundary === "virtual") return WALL_VIRTUAL;
  return WALL_OPEN;
}

const borderStyle = computed(() => ({
  borderTop: wallStyle("N"),
  borderBottom: wallStyle("S"),
  borderLeft: wallStyle("W"),
  borderRight: wallStyle("E"),
}));

const DRAG_THRESHOLD = 4;

function onPointerDown(e: PointerEvent) {
  if (e.button === 2) return;

  e.preventDefault();

  if (e.shiftKey) {
    emit("shift-select", props.room.id);
  } else {
    emit("select", props.room.id);
  }

  const startX = e.clientX;
  const startY = e.clientY;
  let dragging = false;
  const isGrouped = !!props.room.groupId;

  const col = Math.floor(
    (e.offsetX + props.room.x * grid.cellSizePx) / grid.cellSizePx,
  );
  const row = Math.floor(
    (e.offsetY + props.room.y * grid.cellSizePx) / grid.cellSizePx,
  );

  function onPointerMove(e: PointerEvent) {
    if (!dragging) {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      dragging = true;
      if (isGrouped) {
        rooms.startGroupDrag(props.room.groupId!, col, row);
      } else {
        rooms.startDrag(props.room.id, col, row);
      }
    }

    const canvas = canvasInnerRef?.value;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    const col2 = Math.floor((e.clientX - rect.left) / grid.cellSizePx);
    const row2 = Math.floor((e.clientY - rect.top) / grid.cellSizePx);

    if (isGrouped) {
      rooms.moveGroupDrag(col2, row2);
    } else {
      rooms.moveDrag(col2, row2);
    }
  }

  function onPointerUp() {
    if (dragging) {
      if (isGrouped) {
        rooms.endGroupDrag();
      } else {
        rooms.endDrag();
      }
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function onDblClick() {
  emit("open-edit", props.room.id);
}

function onContextMenu() {
  emit("add-fixture", props.room.id);
}

const roomStyle = computed(() => ({
  ...positionStyle.value,
  ...borderStyle.value,
  backgroundColor: props.groupColor ?? "var(--surface-room)",
}));
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div
          class="absolute box-border cursor-grab transition-shadow duration-100"
          :class="{
            'shadow-[0_0_0_2px_var(--room-selected-ring)] z-10': selected,
            'cursor-grabbing opacity-85 z-20': isDragging,
          }"
          :style="roomStyle"
          @pointerdown="onPointerDown"
          @dblclick="onDblClick"
          @contextmenu.prevent="onContextMenu"
        >
          <RoomLabel :room="room" />
        </div>
      </TooltipTrigger>
      <TooltipContent v-if="groupName"> Group: {{ groupName }} </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
