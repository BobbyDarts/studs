<!-- // /src/components/app/shell/groups-panel/GroupsPanel.vue -->

<script setup lang="ts">
import { Crosshair, GripVertical, LayoutList, X } from "@lucide/vue";
import { useStorage, useResizeObserver } from "@vueuse/core";
import { computed, ref } from "vue";

import { Button } from "@/components/ui/button";

import { useSelection } from "@/composables/canvas";
import { useTheme } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";
import { groupIndexToColor, groupIndexToColorDark } from "@/utils/group-colors";

const props = defineProps<{
  mainRef?: HTMLElement | null;
}>();

const emit = defineEmits<{
  "go-to-group": [groupId: string];
}>();

const store = useProjectStore();
const selection = useSelection();
const { themeMode } = useTheme();

const position = useStorage("studs-groups-panel-position", { x: 16, y: 16 });
const visible = useStorage("studs-groups-panel-visible", true);

const isDragging = ref(false);
let dragOffset = { x: 0, y: 0 };

function onPanelPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest("button")) return;
  isDragging.value = true;

  const bounds = props.mainRef?.getBoundingClientRect();
  const ox = bounds?.left ?? 0;
  const oy = bounds?.top ?? 0;

  dragOffset = {
    x: e.clientX - ox - position.value.x,
    y: e.clientY - oy - position.value.y,
  };

  function onMove(e: PointerEvent) {
    const bounds = props.mainRef?.getBoundingClientRect();
    const maxX = bounds ? bounds.width - 198 : window.innerWidth - 198;
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

useResizeObserver(
  computed(() => props.mainRef ?? null),
  (entries) => {
    const width = entries[0]?.contentRect.width ?? 0;
    const height = entries[0]?.contentRect.height ?? 0;
    position.value = {
      x: Math.max(0, Math.min(width - 198, position.value.x)),
      y: Math.max(0, Math.min(height - 48, position.value.y)),
    };
  },
);

const groups = computed(() =>
  store.groups.map((g, index) => {
    const rooms = store.rooms.roomsByGroup(g.id);
    const color =
      themeMode.value === "dark"
        ? groupIndexToColorDark(index)
        : groupIndexToColor(index);
    return {
      ...g,
      roomCount: rooms.length,
      color,
      roomIds: rooms.map((r) => r.id),
    };
  }),
);

function onSelectGroup(roomIds: string[]) {
  selection.selectMany(roomIds);
}

const panelStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}));
</script>

<template>
  <div
    v-if="visible && groups.length > 0"
    ref="panelRef"
    class="absolute z-30 flex flex-col bg-popover border border-border rounded-lg shadow-lg overflow-hidden select-none min-w-44"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    :style="panelStyle"
    @pointerdown="onPanelPointerDown"
  >
    <!-- Header -->
    <div class="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
      <GripVertical class="size-3.5 text-muted-foreground shrink-0" />
      <LayoutList class="size-3.5 text-muted-foreground shrink-0" />
      <span class="text-xs font-medium flex-1">Groups</span>
      <Button
        size="sm"
        variant="ghost"
        class="size-5 p-0"
        @click="visible = false"
      >
        <X class="size-3" />
      </Button>
    </div>

    <!-- Group list -->
    <div class="flex flex-col py-1">
      <div
        v-for="group in groups"
        :key="group.id"
        class="flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer group/row"
        @click="onSelectGroup(group.roomIds)"
      >
        <!-- Color swatch -->
        <div
          class="size-3 rounded-sm shrink-0 border border-black/10"
          :style="{ backgroundColor: group.color }"
        />

        <!-- Name + count -->
        <span class="text-xs flex-1 truncate">{{ group.name }}</span>
        <span class="text-xs text-muted-foreground shrink-0">
          {{ group.roomCount }}
        </span>

        <!-- Go to -->
        <Button
          size="sm"
          variant="ghost"
          class="size-5 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
          @click.stop="emit('go-to-group', group.id)"
        >
          <Crosshair class="size-3" />
        </Button>
      </div>
    </div>
  </div>
</template>
