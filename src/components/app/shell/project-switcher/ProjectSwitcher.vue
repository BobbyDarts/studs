<!-- // /src/components/app/shell/project-switcher/ProjectSwitcher.vue -->

<script setup lang="ts">
import { ref } from "vue";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useConfirmDialog } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";

const store = useProjectStore();
const { confirm } = useConfirmDialog();

const popoverOpen = ref(false);

function onSwitch(id: string) {
  store.switchProject(id);
  popoverOpen.value = false;
}

function onNew() {
  store.newProject();
  popoverOpen.value = false;
}

async function onDeleteClick(id: string, name: string) {
  const confirmed = await confirm({
    title: "Delete project?",
    description: `"${name || "Untitled Project"}" will be permanently deleted. This cannot be undone.`,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "destructive",
  });
  if (!confirmed) return;
  store.deleteProject(id);
}
</script>

<template>
  <Popover v-model:open="popoverOpen">
    <PopoverTrigger class="w-full text-left">
      <div class="px-1 group cursor-pointer">
        <div class="flex items-center gap-1">
          <input
            id="project-name-input"
            v-model="store.projectName"
            class="w-full bg-transparent text-sm font-semibold text-foreground truncate outline-none border-b border-transparent hover:border-border focus:border-ring transition-colors"
            placeholder="Untitled Project"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @click.stop
          />
          <span class="text-muted-foreground text-xs shrink-0">▾</span>
        </div>
      </div>
    </PopoverTrigger>

    <PopoverContent class="w-56 p-1" align="start">
      <div class="flex flex-col gap-0.5">
        <!-- Project list -->
        <div
          v-for="summary in store.projectSummaries"
          :key="summary.id"
          class="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer group"
          :class="summary.id === store.activeId ? 'bg-muted font-medium' : ''"
          @click="onSwitch(summary.id)"
        >
          <span class="flex-1 truncate">{{
            summary.name || "Untitled Project"
          }}</span>
          <button
            v-if="store.projectSummaries.length > 1"
            class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity text-xs px-1"
            @click.stop="onDeleteClick(summary.id, summary.name)"
          >
            ✕
          </button>
        </div>

        <div class="h-px bg-border my-1" />

        <!-- New project -->
        <button
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left w-full"
          @click="onNew"
        >
          <span class="text-muted-foreground">+</span>
          New Project
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
