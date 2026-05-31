<!-- // /src/components/app/fixture/fixture-marker/renderers/BathroomRenderer.vue -->

<script setup lang="ts">
import type { Fixture } from "@/types/fixtures";

import { STROKE_WIDTH } from "./constants";

defineProps<{
  fixture: Fixture;
  cell: number;
}>();
</script>

<template>
  <!-- TOILET -->
  <template v-if="fixture.type === 'toilet'">
    <rect
      :x="cell * 0.1"
      :y="0"
      :width="cell * 0.8"
      :height="cell * 0.35"
      rx="2"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <ellipse
      :cx="cell / 2"
      :cy="cell * 0.7"
      :rx="cell * 0.38"
      :ry="cell * 0.28"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>

  <!-- SINK -->
  <template v-else-if="fixture.type === 'sink'">
    <!-- Double sink -->
    <template v-if="fixture.subtype === 'double'">
      <rect
        :x="0"
        :y="0"
        :width="cell"
        :height="cell * 0.5"
        rx="2"
        fill="none"
        :stroke-width="STROKE_WIDTH.normal"
      />

      <line
        :x1="cell / 2"
        :y1="0"
        :x2="cell / 2"
        :y2="cell * 0.5"
        :stroke-width="STROKE_WIDTH.normal"
      />

      <circle :cx="cell * 0.25" :cy="cell * 0.25" r="3" />

      <circle :cx="cell * 0.75" :cy="cell * 0.25" r="3" />
    </template>

    <!-- Single sink -->
    <template v-else>
      <rect
        :x="cell * 0.1"
        :y="0"
        :width="cell * 0.8"
        :height="cell * 0.5"
        rx="2"
        fill="none"
        :stroke-width="STROKE_WIDTH.normal"
      />

      <circle :cx="cell / 2" :cy="cell * 0.25" r="3" />
    </template>
  </template>

  <!-- BATHTUB -->
  <template v-else-if="fixture.type === 'bathtub'">
    <rect
      :x="0"
      :y="0"
      :width="cell"
      :height="cell * 0.6"
      rx="4"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <circle
      :cx="cell / 2"
      :cy="cell * 0.15"
      :r="cell * 0.1"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>

  <!-- SHOWER -->
  <template v-else-if="fixture.type === 'shower'">
    <rect
      :x="0"
      :y="0"
      :width="cell"
      :height="cell"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <circle
      :cx="cell / 2"
      :cy="cell / 2"
      :r="cell * 0.2"
      fill="none"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <line
      :x1="cell * 0.3"
      :y1="cell * 0.3"
      :x2="cell * 0.7"
      :y2="cell * 0.7"
      :stroke-width="STROKE_WIDTH.thin"
    />

    <line
      :x1="cell * 0.7"
      :y1="cell * 0.3"
      :x2="cell * 0.3"
      :y2="cell * 0.7"
      :stroke-width="STROKE_WIDTH.thin"
    />
  </template>
</template>
