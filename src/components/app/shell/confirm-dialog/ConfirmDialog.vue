<!-- // /src/components/app/shell/confirm-dialog/ConfirmDialog.vue -->

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useConfirmDialog } from "@/composables/ui";

const { open, options, checkboxValue, setCheckboxValue, onConfirm, onCancel } =
  useConfirmDialog();
</script>

<template>
  <AlertDialog :open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ options?.title ?? "Are you sure?" }}
        </AlertDialogTitle>
        <AlertDialogDescription v-if="options?.description">
          {{ options.description }}
        </AlertDialogDescription>
        <AlertDialogDescription v-else class="sr-only">
          {{ options?.title ?? "Are you sure?" }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <!-- Optional checkbox -->
      <div v-if="options?.checkboxLabel" class="flex items-center gap-2 py-1">
        <Checkbox
          id="confirm-checkbox"
          :model-value="checkboxValue"
          @update:model-value="setCheckboxValue($event as boolean)"
        />
        <Label for="confirm-checkbox" class="font-normal cursor-pointer">
          {{ options.checkboxLabel }}
        </Label>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel @click="onCancel">
          {{ options?.cancelLabel ?? "Cancel" }}
        </AlertDialogCancel>
        <AlertDialogAction
          :class="
            options?.variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : ''
          "
          @click="onConfirm"
        >
          {{ options?.confirmLabel ?? "Confirm" }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
