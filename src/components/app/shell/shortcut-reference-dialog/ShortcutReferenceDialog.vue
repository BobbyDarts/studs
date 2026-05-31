<!-- // /src/components/app/shell/shortcut-reference-dialog/ShortcutReferenceDialog.vue -->

<script setup lang="ts">
import { computed } from "vue";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useShortcutReference } from "@/composables/ui";

const { open, closeDialog } = useShortcutReference();

const isMac = computed(
  () =>
    navigator.platform.toUpperCase().includes("MAC") ||
    navigator.userAgent.toUpperCase().includes("MAC"),
);

const mod = computed(() => (isMac.value ? "⌘" : "Ctrl"));

interface Shortcut {
  label: string;
  keys: string[];
  joiner?: "+" | ",";
  muted?: boolean;
}

interface Section {
  id: string;
  title: string;
  shortcuts: Shortcut[];
}

const sections = computed<Section[]>(() => [
  {
    id: "canvas",
    title: "Canvas",
    shortcuts: [
      { label: "Center on grid", keys: ["C"] },
      { label: "Fit to screen", keys: ["F"] },
      { label: "Reset zoom", keys: ["0"] },
      { label: "Zoom in", keys: ["+"] },
      { label: "Zoom out", keys: ["-"] },
    ],
  },
  {
    id: "project",
    title: "Project",
    shortcuts: [
      { label: "New Project", keys: ["P"] },
      { label: "Switch Project", keys: ["Sidebar ▾"], muted: true },
      { label: "Export JSON", keys: [mod.value, "S"], joiner: "+" },
      { label: "Export SVG", keys: [mod.value, "Shift", "S"], joiner: "+" },
      { label: "Import JSON", keys: [mod.value, "Shift", "O"], joiner: "+" },
    ],
  },
  {
    id: "edit",
    title: "Edit",
    shortcuts: [
      { label: "Add Room", keys: ["R"] },
      { label: "Undo", keys: [mod.value, "Z"], joiner: "+" },
      { label: "Redo", keys: [mod.value, "Shift", "Z"], joiner: "+" },
    ],
  },
  {
    id: "units",
    title: "Units",
    shortcuts: [
      { label: "Switch to Imperial", keys: ["U", "I"], joiner: "," },
      { label: "Switch to Metric", keys: ["U", "M"], joiner: "," },
    ],
  },
  {
    id: "general",
    title: "General",
    shortcuts: [
      { label: "Toggle sidebar", keys: ["B"] },
      { label: "Toggle groups panel", keys: ["G"] },
      { label: "Toggle theme", keys: ["T"] },
      { label: "Show this reference", keys: ["?"] },
    ],
  },
]);

const maxShortcuts = computed(() =>
  Math.max(...sections.value.map((s) => s.shortcuts.length)),
);

const minHeight = computed(() => `${maxShortcuts.value * 28 + 16}px`);
</script>

<template>
  <Dialog :open="open" @update:open="closeDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogDescription>
          Available shortcuts when not in an input field.
        </DialogDescription>
      </DialogHeader>

      <Tabs :default-value="sections[0]!.id">
        <TabsList class="w-full">
          <TabsTrigger
            v-for="section in sections"
            :key="section.id"
            :value="section.id"
            class="flex-1 cursor-pointer"
          >
            {{ section.title }}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="section in sections"
          :key="section.id"
          :value="section.id"
          class="mt-3"
          :style="{ minHeight }"
        >
          <div class="space-y-1.5">
            <div
              v-for="shortcut in section.shortcuts"
              :key="shortcut.label"
              class="flex items-center justify-between text-sm"
            >
              <span :class="shortcut.muted ? 'text-muted-foreground' : ''">
                {{ shortcut.label }}
              </span>

              <div class="flex items-center gap-1">
                <template
                  v-for="(key, index) in shortcut.keys"
                  :key="`${shortcut.label}-${key}-${index}`"
                >
                  <span
                    :class="
                      shortcut.muted
                        ? 'text-xs text-muted-foreground'
                        : 'px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono'
                    "
                  >
                    {{ key }}
                  </span>

                  <span
                    v-if="shortcut.joiner && index < shortcut.keys.length - 1"
                    class="text-xs text-muted-foreground px-0.5"
                  >
                    {{ shortcut.joiner }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
