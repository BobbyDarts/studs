// /src/stores/project.ts

import { defineStore } from "pinia";

import { useProject } from "@/composables/canvas";

export const useProjectStore = defineStore("project", () => {
  return useProject();
});
