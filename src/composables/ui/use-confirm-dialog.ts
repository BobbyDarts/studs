// /src/composables/ui/use-confirm-dialog.ts

import { ref } from "vue";

import { createDialogState } from "@/lib/dialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  checkboxLabel?: string;
  checkboxDefault?: boolean;
}

const state = createDialogState<ConfirmOptions>();
const resolveRef = ref<((value: boolean) => void) | null>(null);
const checkboxValue = ref(false);

export function useConfirmDialog() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    checkboxValue.value = options.checkboxDefault ?? false;
    state.openDialog(options);
    return new Promise((resolve) => {
      resolveRef.value = resolve;
    });
  }

  function onConfirm() {
    resolveRef.value?.(true);
    resolveRef.value = null;
    state.closeDialog();
  }

  function onCancel() {
    resolveRef.value?.(false);
    resolveRef.value = null;
    state.closeDialog();
  }

  return {
    open: state.open,
    options: state.payload,
    checkboxValue,
    setCheckboxValue: (v: boolean) => {
      checkboxValue.value = v;
    },
    confirm,
    onConfirm,
    onCancel,
  };
}
