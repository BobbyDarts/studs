<!-- // /src/components/app/fixture/fixture-marker/renderers/DoorRenderer.vue -->

<script setup lang="ts">
import type { DoorFixture } from "@/types/fixtures";

import { STROKE_WIDTH } from "./constants";

defineProps<{
  fixture: DoorFixture;
  cell: number;
}>();
</script>

<template>
  <!-- French -->
  <template v-if="fixture.subtype === 'french'">
    <line
      :x1="0"
      :y1="0"
      :x2="cell / 2"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <path
      :d="`M 0 0 A ${cell / 2} ${cell / 2} 0 0 1 0 ${cell / 2}`"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <line
      :x1="cell / 2"
      :y1="0"
      :x2="cell"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <path
      :d="`M ${cell} 0 A ${cell / 2} ${cell / 2} 0 0 0 ${cell} ${cell / 2}`"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>

  <!-- Sliding -->
  <template v-else-if="fixture.subtype === 'sliding'">
    <line
      :x1="0"
      :y1="0"
      :x2="cell"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <rect
      :x="cell * 0.1"
      :y="2"
      :width="cell * 0.45"
      :height="cell * 0.2"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <rect
      :x="cell * 0.45"
      :y="2"
      :width="cell * 0.45"
      :height="cell * 0.2"
      :stroke-width="STROKE_WIDTH.normal"
      stroke-dasharray="3,2"
    />
  </template>

  <!-- Pocket -->
  <template v-else-if="fixture.subtype === 'pocket'">
    <line
      :x1="0"
      :y1="0"
      :x2="cell"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <rect
      :x="cell * 0.1"
      :y="2"
      :width="cell * 0.8"
      :height="cell * 0.25"
      :stroke-width="STROKE_WIDTH.normal"
      stroke-dasharray="4,2"
    />

    <line
      :x1="cell * 0.5"
      :y1="2"
      :x2="cell * 0.5"
      :y2="cell * 0.27"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>

  <!-- Bifold -->
  <template v-else-if="fixture.subtype === 'bifold'">
    <line
      :x1="0"
      :y1="0"
      :x2="cell"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <path
      :d="`M 0 0 L ${cell * 0.25} ${cell * 0.35} L ${cell * 0.5} 0`"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <path
      :d="`M ${cell * 0.5} 0 L ${cell * 0.75} ${cell * 0.35} L ${cell} 0`"
      :stroke-width="STROKE_WIDTH.normal"
    />
  </template>

  <!-- Standard -->
  <template v-else>
    <line
      :x1="0"
      :y1="0"
      :x2="cell"
      :y2="0"
      :stroke-width="STROKE_WIDTH.heavy"
    />

    <line
      :x1="0"
      :y1="0"
      :x2="0"
      :y2="cell"
      :stroke-width="STROKE_WIDTH.normal"
    />

    <path
      :d="`M 0 ${cell} A ${cell} ${cell} 0 0 1 ${cell} 0`"
      :stroke-width="STROKE_WIDTH.normal"
      stroke-dasharray="4,2"
    />
  </template>
</template>
