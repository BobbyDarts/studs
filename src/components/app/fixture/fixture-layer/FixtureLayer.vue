<!-- // /src/components/app/fixture/fixture-layer/FixtureLayer.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { FixtureMarker } from "@/components/app/fixture";
import { useProjectStore } from "@/stores/project";

const emit = defineEmits<{
  "edit-fixture": [roomId: string, fixtureId: string];
}>();

const store = useProjectStore();

const roomsWithFixtures = computed(() => {
  const result = store.rooms.rooms.map((room) => ({
    room,
    fixtures: [...room.fixtures],
  }));
  return result;
});
</script>

<template>
  <div class="absolute inset-0 pointer-events-none z-30">
    <template v-for="entry in roomsWithFixtures" :key="entry.room.id">
      <FixtureMarker
        v-for="fixture in entry.fixtures"
        :key="fixture.id"
        :fixture="fixture"
        :room="entry.room"
        @edit-fixture="
          (roomId, fixtureId) => emit('edit-fixture', roomId, fixtureId)
        "
      />
    </template>
  </div>
</template>
