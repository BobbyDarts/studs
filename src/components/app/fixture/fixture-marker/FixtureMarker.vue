<!-- // /src/components/app/fixture/fixture-marker/FixtureMarker.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { useProjectStore } from "@/stores/project";
import type { Fixture } from "@/types/fixtures";
import type { Room } from "@/types/project";

import { RENDERERS } from "./renderer-registry";

const props = defineProps<{
  fixture: Fixture;
  room: Room;
}>();

const emit = defineEmits<{
  "edit-fixture": [roomId: string, fixtureId: string];
}>();

const store = useProjectStore();

const CELL = computed(() => store.grid.cellSizePx);

const position = computed(() => {
  const cell = store.grid.cellSizePx;
  const rx = props.room.x * cell;
  const ry = props.room.y * cell;
  const rw = Math.round(store.grid.cmToCells(props.room.widthCm)) * cell;
  const rh = Math.round(store.grid.cmToCells(props.room.depthCm)) * cell;
  const offset = store.grid.cmToCells(props.fixture.offsetCm) * cell;

  const positions = {
    N: { x: rx + offset, y: ry, angle: 0 },
    S: { x: rx + offset, y: ry + rh, angle: 180 },
    W: { x: rx, y: ry + offset, angle: 270 },
    E: { x: rx + rw, y: ry + offset, angle: 90 },
  };

  return positions[props.fixture.wall];
});

const wrapperStyle = computed(() => ({
  position: "absolute" as const,
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: `${CELL.value}px`,
  height: `${CELL.value}px`,
  transform: `rotate(${position.value.angle}deg)`,
  transformOrigin: "0 0",
  pointerEvents: "none" as const,
}));

const Renderer = computed(
  () => RENDERERS.find((r) => r.match(props.fixture))?.component,
);
</script>

<template>
  <div
    :style="wrapperStyle"
    style="pointer-events: auto; cursor: pointer"
    @pointerdown.stop
    @click.stop="emit('edit-fixture', room.id, fixture.id)"
  >
    <svg :width="CELL" :height="CELL" overflow="visible">
      <g
        class="fixture-marker"
        fill="none"
        stroke="var(--wall-color)"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <component
          :is="Renderer"
          v-if="Renderer"
          :fixture="fixture"
          :cell="CELL"
        />
      </g>
    </svg>
  </div>
</template>
