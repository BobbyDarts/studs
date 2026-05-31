// /src/composables/keyboard/use-input-guard.ts

import { useActiveElement } from "@vueuse/core";
import { computed } from "vue";

export function useInputGuard() {
  const activeElement = useActiveElement();

  const notUsingInput = computed(() => {
    const tag = activeElement.value?.tagName ?? "";
    const inDialog = activeElement.value?.closest('[role="dialog"]') !== null;
    return !["INPUT", "TEXTAREA", "SELECT"].includes(tag) && !inDialog;
  });

  return {
    notUsingInput,
  };
}
