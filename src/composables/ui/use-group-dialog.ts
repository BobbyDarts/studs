// /src/composables/ui/use-group-dialog.ts

import { ref } from "vue";

import { createDialogState } from "@/lib/dialog";

export type GroupDialogMode = "create" | "rename" | "merge";

export interface GroupDialogOptions {
  mode: GroupDialogMode;
  initialName?: string;
  groupIds?: string[];
}

const state = createDialogState<GroupDialogOptions>();
const resolveRef = ref<((name: string | null) => void) | null>(null);

export function useGroupDialog() {
  function openGroupDialog(
    options: GroupDialogOptions,
  ): Promise<string | null> {
    state.openDialog(options);
    return new Promise((resolve) => {
      resolveRef.value = resolve;
    });
  }

  function onConfirm(name: string) {
    resolveRef.value?.(name);
    resolveRef.value = null;
    state.closeDialog();
  }

  function onCancel() {
    resolveRef.value?.(null);
    resolveRef.value = null;
    state.closeDialog();
  }

  return {
    open: state.open,
    options: state.payload,
    openGroupDialog,
    onConfirm,
    onCancel,
  };
}
