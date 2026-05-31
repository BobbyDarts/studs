<!-- // /src/components/app/canvas/floorplan-canvas/FloorplanCanvas.vue -->

<script setup lang="ts">
import { onMounted, provide, ref } from "vue";

import { GridOverlay } from "@/components/app/canvas";
import { useCanvasControls } from "@/composables/canvas";
import { useProjectStore } from "@/stores/project";

const emit = defineEmits<{
  "click-canvas": [];
}>();
const canvasInnerRef = ref<HTMLElement | null>(null);
provide("canvasInnerRef", canvasInnerRef);

const scrollRef = ref<HTMLElement | null>(null);

const controls = useCanvasControls(() => scrollRef.value);

defineExpose({
  fitToScreen: controls.fitToScreen,
  scrollToCenter: controls.scrollToRooms,
  centerOnGrid: controls.centerOnGrid,
  resetZoom: controls.resetZoom,
  zoomIn: controls.zoomIn,
  zoomOut: controls.zoomOut,
});

// Need store just for canvas dimensions and zoom display
const store = useProjectStore();

// --- Zoom to viewport center ---
function onWheel(e: WheelEvent) {
  e.preventDefault();

  const scroller = scrollRef.value;
  if (!scroller) return;

  const rect = scroller.getBoundingClientRect();

  const mouseCanvasX = e.clientX - rect.left + scroller.scrollLeft;
  const mouseCanvasY = e.clientY - rect.top + scroller.scrollTop;

  const oldCellSize = store.grid.cellSizePx;
  store.grid.zoom(-e.deltaY);
  const newCellSize = store.grid.cellSizePx;

  const scale = newCellSize / oldCellSize;
  scroller.scrollLeft = mouseCanvasX * scale - (e.clientX - rect.left);
  scroller.scrollTop = mouseCanvasY * scale - (e.clientY - rect.top);
}

// --- Pan ---
const isPanning = ref(false);
const isSpaceDown = ref(false);
let panStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

function onKeyDown(e: KeyboardEvent) {
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    isSpaceDown.value = true;
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === "Space") {
    isSpaceDown.value = false;
    isPanning.value = false;
  }
}

function onPointerDown(e: PointerEvent) {
  const isMiddle = e.button === 1;
  const isSpaceDrag = isSpaceDown.value && e.button === 0;
  if (!isMiddle && !isSpaceDrag) return;

  e.preventDefault();
  isPanning.value = true;
  panStart = {
    x: e.clientX,
    y: e.clientY,
    scrollLeft: scrollRef.value?.scrollLeft ?? 0,
    scrollTop: scrollRef.value?.scrollTop ?? 0,
  };

  function onPointerMove(e: PointerEvent) {
    if (!isPanning.value || !scrollRef.value) return;
    scrollRef.value.scrollLeft = panStart.scrollLeft - (e.clientX - panStart.x);
    scrollRef.value.scrollTop = panStart.scrollTop - (e.clientY - panStart.y);
  }

  function onPointerUp() {
    isPanning.value = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

onMounted(() => {
  controls.scrollToRooms();
});
</script>

<template>
  <div class="relative flex-1 overflow-hidden">
    <!-- Scrollable canvas -->
    <div
      ref="scrollRef"
      class="overflow-auto w-full h-full bg-canvas-bg outline-none"
      :class="isSpaceDown ? 'cursor-grab' : ''"
      tabindex="0"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @click.self="emit('click-canvas')"
    >
      <div
        ref="canvasInnerRef"
        class="relative"
        :style="{
          width: `${store.grid.canvasWidthPx}px`,
          height: `${store.grid.canvasHeightPx}px`,
        }"
      >
        <GridOverlay />
        <slot />
      </div>
    </div>
  </div>
</template>
