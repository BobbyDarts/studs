<!-- // /src/components/app/room/room-label/RoomLabel.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { useProjectStore } from "@/stores/project";
import type { Room } from "@/types/project";
import { cmToDisplay } from "@/utils/units";

const props = defineProps<{ room: Room }>();

const store = useProjectStore();

const widthLabel = computed(() => cmToDisplay(props.room.widthCm, store.units));
const depthLabel = computed(() => cmToDisplay(props.room.depthCm, store.units));
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-0.5 h-full pointer-events-none select-none"
  >
    <span
      class="text-[11px] font-semibold tracking-wide uppercase text-foreground text-center"
    >
      {{ room.name }}
    </span>
    <span class="text-[10px] text-muted-foreground">
      {{ widthLabel }} W × {{ depthLabel }} D
    </span>
  </div>
</template>
