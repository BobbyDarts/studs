// /src/composables/ui/use-shortcut-reference.ts

import { ref } from "vue";

const open = ref(false);

export function useShortcutReference() {
  function openDialog() {
    open.value = true;
  }

  function closeDialog() {
    open.value = false;
  }

  function toggleDialog() {
    open.value = !open.value;
  }

  return { open, openDialog, closeDialog, toggleDialog };
}
