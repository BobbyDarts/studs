<!-- // /src/components/app/shell/app-sidebar/AppSidebar.vue -->

<script setup lang="ts">
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileJson,
  FolderOpen,
  Ruler,
  Upload,
} from "@lucide/vue";
import { useStorage } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ProjectSwitcher } from "@/components/app/shell/project-switcher";
import { useProjectStore } from "@/stores/project";

const emit = defineEmits<{
  "import-click": [];
}>();

const store = useProjectStore();

const expanded = useStorage("studs-sidebar-expanded", true);

const projectPopoverOpen = ref(false);
const deadSpacePopoverOpen = ref(false);

const expandedWidth = 208;
const collapsedWidth = 48;

function toggle() {
  expanded.value = !expanded.value;
}

function toggleUnits() {
  store.units = store.units === "imperial" ? "metric" : "imperial";
}

const hasDeadSpace = computed(
  () => store.deadSpace.allDeadSpaceCells.length > 0,
);

watch(
  () => store.activeId,
  () => {
    projectPopoverOpen.value = false;
  },
);
</script>

<template>
  <TooltipProvider>
    <div class="flex shrink-0">
      <aside
        class="flex flex-col shrink-0 border-r border-border bg-card overflow-hidden transition-[width] duration-200"
        :style="{
          width: expanded ? `${expandedWidth}px` : `${collapsedWidth}px`,
        }"
      >
        <!-- Logo area -->
        <div
          class="flex items-center justify-center border-b border-border px-3 h-14 shrink-0 gap-2 bg-secondary"
        >
          <div
            class="shrink-0 size-8 rounded bg-[#1E4E80] flex items-center justify-center text-white font-black text-lg select-none"
          >
            S
          </div>
          <span
            class="font-black text-lg tracking-widest text-[#1E4E80] dark:text-[#2D6FA3] uppercase whitespace-nowrap transition-all duration-200 overflow-hidden"
            :style="{
              maxWidth: expanded ? '120px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            Studs
          </span>
        </div>

        <!-- Project switcher -->
        <div class="border-b border-border shrink-0 px-2 py-3">
          <!-- Expanded: full switcher -->
          <div
            class="transition-all duration-200 overflow-hidden"
            :style="{
              maxHeight: expanded ? '200px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            <div class="px-1">
              <ProjectSwitcher />
            </div>
          </div>
          <!-- Collapsed: icon -->
          <div
            class="flex justify-center transition-all duration-200"
            :style="{
              maxHeight: expanded ? '0px' : '40px',
              opacity: expanded ? 0 : 1,
            }"
          >
            <Popover v-model:open="projectPopoverOpen">
              <PopoverTrigger as-child>
                <Button variant="ghost" size="sm" class="size-8 p-0">
                  <FolderOpen class="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" class="w-56 p-2">
                <ProjectSwitcher />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <!-- Units -->
        <!-- Units -->
        <div class="border-b border-border shrink-0 px-2 py-3">
          <!-- Section label -->
          <div
            class="overflow-hidden transition-all duration-200"
            :style="{
              maxHeight: expanded ? '24px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            <span
              class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5 px-1"
            >
              Units
            </span>
          </div>

          <!-- Expanded toggle -->
          <div
            class="overflow-hidden transition-all duration-200"
            :style="{
              maxHeight: expanded ? '40px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            <div
              class="flex rounded-md border border-input overflow-hidden text-xs mx-1"
            >
              <button
                class="flex-1 py-1.5 transition-colors"
                :class="
                  store.units === 'imperial'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted'
                "
                @click="toggleUnits"
              >
                Imperial
              </button>
              <button
                class="flex-1 py-1.5 transition-colors"
                :class="
                  store.units === 'metric'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted'
                "
                @click="toggleUnits"
              >
                Metric
              </button>
            </div>
          </div>

          <!-- Collapsed icon -->
          <div
            class="flex justify-center transition-all duration-200"
            :style="{
              maxHeight: expanded ? '0px' : '32px',
              opacity: expanded ? 0 : 1,
            }"
          >
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="size-8 p-0"
                  @click="toggleUnits"
                >
                  <Ruler class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Units: {{ store.units === "imperial" ? "Imperial" : "Metric" }}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <!-- Data -->
        <div class="border-b border-border shrink-0 p-2 flex flex-col gap-1">
          <div
            class="overflow-hidden transition-all duration-200"
            :style="{
              maxHeight: expanded ? '24px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            <span
              class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-0.5 px-1"
            >
              Data
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="sm"
                variant="ghost"
                class="justify-start gap-2 w-full"
                @click="store.exportJson()"
              >
                <FileJson class="size-4 shrink-0" />
                <span
                  class="whitespace-nowrap transition-all duration-200 overflow-hidden"
                  :style="{
                    maxWidth: expanded ? '120px' : '0px',
                    opacity: expanded ? 1 : 0,
                  }"
                >
                  Export JSON...
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent v-if="!expanded" side="right"
              >Export JSON</TooltipContent
            >
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="sm"
                variant="ghost"
                class="justify-start gap-2 w-full"
                @click="store.exportSvg()"
              >
                <FileImage class="size-4 shrink-0" />
                <span
                  class="whitespace-nowrap transition-all duration-200 overflow-hidden"
                  :style="{
                    maxWidth: expanded ? '120px' : '0px',
                    opacity: expanded ? 1 : 0,
                  }"
                >
                  Export SVG...
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent v-if="!expanded" side="right"
              >Export SVG</TooltipContent
            >
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="sm"
                variant="ghost"
                class="justify-start gap-2 w-full"
                @click="emit('import-click')"
              >
                <Upload class="size-4 shrink-0" />
                <span
                  class="whitespace-nowrap transition-all duration-200 overflow-hidden"
                  :style="{
                    maxWidth: expanded ? '120px' : '0px',
                    opacity: expanded ? 1 : 0,
                  }"
                >
                  Import JSON...
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent v-if="!expanded" side="right"
              >Import JSON</TooltipContent
            >
          </Tooltip>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Dead space summary -->
        <div
          v-if="hasDeadSpace"
          class="border-t border-border shrink-0 bg-secondary"
          :class="expanded ? 'px-3 py-3' : 'px-2 py-3 flex justify-center'"
        >
          <!-- Expanded -->
          <div
            class="overflow-hidden transition-all duration-200"
            :style="{
              maxHeight: expanded ? '80px' : '0px',
              opacity: expanded ? 1 : 0,
            }"
          >
            <span
              class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
            >
              Dead Space
            </span>
            <div class="flex flex-col gap-0.5">
              <span
                v-if="store.deadSpace.enclosedCells.length > 0"
                class="text-xs text-destructive"
              >
                Enclosed: {{ store.deadSpace.enclosedCells.length }} cells
              </span>
              <span
                v-if="store.deadSpace.boundingBoxCells.length > 0"
                class="text-xs"
                :style="{ color: 'var(--dead-space-bounds-stroke)' }"
              >
                Remainder: {{ store.deadSpace.boundingBoxCells.length }} cells
              </span>
            </div>
          </div>

          <!-- Collapsed -->
          <div
            class="flex justify-center transition-all duration-200"
            :style="{
              maxHeight: expanded ? '0px' : '32px',
              opacity: expanded ? 0 : 1,
            }"
          >
            <Popover v-model:open="deadSpacePopoverOpen">
              <PopoverTrigger as-child>
                <Button variant="ghost" size="sm" class="size-8 p-0">
                  <AlertTriangle class="size-4 text-destructive" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" class="w-48 p-3">
                <span
                  class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  Dead Space
                </span>
                <div class="flex flex-col gap-0.5">
                  <span
                    v-if="store.deadSpace.enclosedCells.length > 0"
                    class="text-xs text-destructive"
                  >
                    Enclosed: {{ store.deadSpace.enclosedCells.length }} cells
                  </span>
                  <span
                    v-if="store.deadSpace.boundingBoxCells.length > 0"
                    class="text-xs"
                    :style="{ color: 'var(--dead-space-bounds-stroke)' }"
                  >
                    Remainder:
                    {{ store.deadSpace.boundingBoxCells.length }} cells
                  </span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>

      <!-- Collapse tab -->
      <button
        class="w-3 h-12 self-center flex items-center justify-center bg-card border border-l-0 border-border rounded-r cursor-pointer hover:bg-muted transition-colors"
        @click="toggle"
      >
        <component
          :is="expanded ? ChevronLeft : ChevronRight"
          class="size-3 text-muted-foreground"
        />
      </button>
    </div>
  </TooltipProvider>
</template>
