<!-- // /src/components/app/fixture/fixture-marker/renderers/WindowRenderer.vue -->

<script setup lang="ts">
import type { WindowFixture } from "@/types/fixtures";

import { STROKE_WIDTH } from "./constants";

defineProps<{
  fixture: WindowFixture;
  cell: number;
}>();
</script>

<template>
  <!-- Main sill / frame -->
  <line :x1="0" :y1="0" :x2="cell" :y2="0" :stroke-width="STROKE_WIDTH.heavy" />

  <!-- Glass panes -->
  <line
    :x1="0"
    :y1="4"
    :x2="cell"
    :y2="4"
    :stroke-width="STROKE_WIDTH.normal"
  />

  <line
    :x1="0"
    :y1="8"
    :x2="cell"
    :y2="8"
    :stroke-width="STROKE_WIDTH.normal"
  />

  <!-- Bay window option -->
  <template v-if="fixture.subtype === 'bay'">
    <rect
      :x="cell * 0.1"
      :y="8"
      :width="cell * 0.8"
      :height="cell * 0.3"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>
</template>
