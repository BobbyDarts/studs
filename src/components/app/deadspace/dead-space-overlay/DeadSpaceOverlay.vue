<!-- // /src/components/app/deadspace/dead-space-overlay/DeadSpaceOverlay.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { useProjectStore } from "@/stores/project";

const store = useProjectStore();
const { grid, deadSpace } = store;

const enclosedCells = computed(() => deadSpace.enclosedCells);
const boundingBoxCells = computed(() => deadSpace.boundingBoxCells);

const cellPx = computed(() => grid.cellSizePx);
</script>

<template>
  <svg
    class="absolute inset-0 pointer-events-none"
    :width="grid.canvasWidthPx"
    :height="grid.canvasHeightPx"
    aria-hidden="true"
  >
    <!-- Type B: bounding box remainder (rendered first, lower z) -->
    <rect
      v-for="cell in boundingBoxCells"
      :key="`bb-${cell.x}-${cell.y}`"
      :x="cell.x * cellPx"
      :y="cell.y * cellPx"
      :width="cellPx"
      :height="cellPx"
      fill="var(--dead-space-bounds-fill)"
      stroke="var(--dead-space-bounds-stroke)"
      stroke-width="0.5"
    />

    <!-- Type A: enclosed gaps (rendered on top, higher priority) -->
    <rect
      v-for="cell in enclosedCells"
      :key="`enc-${cell.x}-${cell.y}`"
      :x="cell.x * cellPx"
      :y="cell.y * cellPx"
      :width="cellPx"
      :height="cellPx"
      fill="var(--dead-space-enclosed-fill)"
      stroke="var(--dead-space-enclosed-stroke)"
      stroke-width="0.5"
    />
  </svg>
</template>
