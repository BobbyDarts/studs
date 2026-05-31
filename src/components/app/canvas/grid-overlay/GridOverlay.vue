<!-- // /src/components/app/canvas/grid-overlay/GridOverlay.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { useProjectStore } from "@/stores/project";

const store = useProjectStore();
const { grid } = store;

interface GridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}

const verticalLines = computed<GridLine[]>(() => {
  const lines: GridLine[] = [];
  const h = grid.canvasHeightPx;
  for (let col = 0; col <= grid.cols; col++) {
    const x = col * grid.cellSizePx;
    lines.push({ x1: x, y1: 0, x2: x, y2: h, major: col % 10 === 0 });
  }
  return lines;
});

const horizontalLines = computed<GridLine[]>(() => {
  const lines: GridLine[] = [];
  const w = grid.canvasWidthPx;
  for (let row = 0; row <= grid.rows; row++) {
    const y = row * grid.cellSizePx;
    lines.push({ x1: 0, y1: y, x2: w, y2: y, major: row % 10 === 0 });
  }
  return lines;
});

function gridStroke(major: boolean) {
  return major ? "var(--grid-major)" : "var(--grid-minor)";
}

function gridStrokeWidth(major: boolean) {
  return major ? 0.75 : 0.5;
}
</script>

<template>
  <svg
    class="absolute inset-0 pointer-events-none"
    :width="grid.canvasWidthPx"
    :height="grid.canvasHeightPx"
    aria-hidden="true"
  >
    <line
      v-for="(line, i) in [...verticalLines, ...horizontalLines]"
      :key="i"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      :stroke="gridStroke(line.major)"
      :stroke-width="gridStrokeWidth(line.major)"
    />
  </svg>
</template>
