<!-- // /src/components/app/fixture/fixture-marker/renderers/StructureRenderer.vue -->

<script setup lang="ts">
import type { Fixture } from "@/types/fixtures";

import { STROKE_WIDTH } from "./constants";

defineProps<{
  fixture: Fixture;
  cell: number;
}>();
</script>

<template>
  <!-- FIREPLACE -->
  <template v-if="fixture.type === 'fireplace'">
    <rect
      :x="0"
      :y="0"
      :width="cell"
      :height="cell * 0.4"
      fill="none"
      :stroke-width="STROKE_WIDTH.thin"
    />

    <rect
      :x="cell * 0.2"
      :y="cell * 0.05"
      :width="cell * 0.6"
      :height="cell * 0.3"
      fill="var(--grid-minor)"
      :stroke-width="STROKE_WIDTH.thin"
    />
  </template>

  <!-- STAIRS -->
  <template v-else-if="fixture.type === 'stairs'">
    <rect
      :x="0"
      :y="0"
      :width="cell"
      :height="cell"
      fill="none"
      :stroke-width="STROKE_WIDTH.thin"
    />

    <!-- L-shaped stairs -->
    <template v-if="fixture.subtype === 'l-shaped'">
      <line
        v-for="i in 5"
        :key="i"
        :x1="0"
        :y1="(i - 1) * (cell / 5)"
        :x2="cell - (i - 1) * (cell / 5)"
        :y2="(i - 1) * (cell / 5)"
        :stroke-width="STROKE_WIDTH.thin"
      />
    </template>

    <!-- Straight stairs -->
    <template v-else>
      <line
        v-for="i in 5"
        :key="i"
        :x1="0"
        :y1="(i - 1) * (cell / 5)"
        :x2="cell"
        :y2="(i - 1) * (cell / 5)"
        :stroke-width="STROKE_WIDTH.thin"
      />
    </template>
  </template>
</template>
